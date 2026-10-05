-- Test checkout: server-only RPCs; the store stays closed until sandbox credentials and preview URL are verified.
begin;

alter table public.orders drop constraint orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('mercadopago','pix','credit_card','debit_card','cash','card_on_delivery'));
alter table public.payments add column checkout_url text;

update public.store_settings
set pickup_enabled = true, pix_enabled = true, card_enabled = true,
    delivery_enabled = false, ordering_enabled = false, opening_override = 'schedule'
where store_id = '10000000-0000-4000-8000-000000000001';

create function public.create_checkout_order(
  p_store_id uuid, p_session_hash text, p_idempotency_key uuid, p_payload_hash text,
  p_customer_name text, p_customer_phone text, p_customer_email text,
  p_order_type text, p_customer_notes text, p_items jsonb, p_address jsonb default null
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  request_row public.checkout_requests%rowtype;
  settings_row public.store_settings%rowtype;
  item_json jsonb;
  option_json jsonb;
  product_row public.products%rowtype;
  size_row public.product_sizes%rowtype;
  option_row record;
  group_row record;
  v_item_id uuid;
  v_order_id uuid;
  v_payment_id uuid;
  v_number bigint;
  v_qty integer;
  v_unit bigint;
  v_subtotal bigint := 0;
  v_fee integer := 0;
  v_options jsonb;
  v_size_id uuid;
  v_note text;
  v_selected integer;
  v_local_time timestamp;
  v_weekday integer;
  v_cep text;
begin
  if p_session_hash !~ '^[a-f0-9]{64}$' or p_payload_hash !~ '^[a-f0-9]{64}$'
     or length(btrim(p_customer_name)) not between 2 and 120
     or p_customer_phone !~ '^[0-9]{10,11}$'
     or (p_customer_email is not null and length(p_customer_email) > 254)
     or length(p_customer_notes) > 1000
     or p_order_type not in ('pickup','delivery')
     or jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) not between 1 and 100 then
    raise exception 'INVALID_CHECKOUT' using errcode = '22023';
  end if;

  insert into public.checkout_requests(session_hash,idempotency_key,payload_hash)
  values (p_session_hash,p_idempotency_key,p_payload_hash)
  on conflict (session_hash,idempotency_key) do nothing;
  select * into request_row from public.checkout_requests
    where session_hash=p_session_hash and idempotency_key=p_idempotency_key for update;
  if request_row.payload_hash <> p_payload_hash then
    raise exception 'IDEMPOTENCY_CONFLICT' using errcode = '22023';
  end if;
  if request_row.order_id is not null then
    select id into v_payment_id from public.payments where order_id=request_row.order_id and attempt=1;
    select public_order_number into v_number from public.orders where id=request_row.order_id;
    return jsonb_build_object('order_id',request_row.order_id,'payment_id',v_payment_id,
      'number',v_number,'existing',true);
  end if;

  select ss.* into settings_row from public.store_settings ss
    join public.stores s on s.id=ss.store_id
    where ss.store_id=p_store_id and s.active for share of ss;
  if not found or not settings_row.ordering_enabled then
    raise exception 'ORDERING_DISABLED' using errcode = 'P0001';
  end if;
  if settings_row.opening_override='closed' then
    raise exception 'STORE_CLOSED' using errcode = 'P0001';
  end if;
  if settings_row.opening_override='schedule' then
    v_local_time := now() at time zone settings_row.timezone;
    v_weekday := extract(dow from v_local_time)::integer;
    if not exists (
      select 1 from public.store_hours h where h.store_id=p_store_id
      and ((h.weekday=v_weekday and not h.closes_next_day
            and v_local_time::time >= h.opens_at and v_local_time::time < h.closes_at)
        or (h.weekday=v_weekday and h.closes_next_day and v_local_time::time >= h.opens_at)
        or (h.weekday=(v_weekday+6)%7 and h.closes_next_day and v_local_time::time < h.closes_at))
    ) then raise exception 'STORE_CLOSED' using errcode = 'P0001'; end if;
  end if;
  if p_order_type='pickup' and not settings_row.pickup_enabled then
    raise exception 'PICKUP_DISABLED' using errcode = 'P0001';
  end if;
  if p_order_type='delivery' then
    if not settings_row.delivery_enabled or jsonb_typeof(p_address) is distinct from 'object' then
      raise exception 'DELIVERY_DISABLED' using errcode = 'P0001';
    end if;
    v_cep := p_address->>'cep';
    if v_cep !~ '^[0-9]{8}$' or length(coalesce(p_address->>'street','')) < 2
       or length(coalesce(p_address->>'number','')) < 1
       or length(coalesce(p_address->>'neighborhood','')) < 2 then
      raise exception 'INVALID_ADDRESS' using errcode = '22023';
    end if;
    select z.fee_cents into v_fee from public.delivery_zones z
      where z.store_id=p_store_id and z.active and v_cep between z.cep_start and z.cep_end
        and lower(z.city)=lower(p_address->>'city') and z.state=upper(p_address->>'state')
      order by z.fee_cents desc limit 1;
    if not found then raise exception 'OUTSIDE_DELIVERY_ZONE' using errcode = 'P0001'; end if;
  end if;

  -- Lock the catalog rows while pricing. Concurrent price changes cannot alter this snapshot.
  for item_json in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(item_json) is distinct from 'object'
       or (item_json->>'quantity') !~ '^[0-9]{1,2}$'
       or jsonb_typeof(item_json->'optionIds') is distinct from 'array' then
      raise exception 'INVALID_ITEM' using errcode = '22023';
    end if;
    v_qty := (item_json->>'quantity')::integer;
    if v_qty not between 1 and 99 or jsonb_array_length(item_json->'optionIds') > 30 then
      raise exception 'INVALID_ITEM' using errcode = '22023';
    end if;
    v_note := coalesce(item_json->>'notes','');
    if length(v_note)>280 then raise exception 'INVALID_NOTES' using errcode = '22023'; end if;
    select p.* into product_row from public.products p
      join public.categories c on c.id=p.category_id and c.store_id=p.store_id
      where p.id=(item_json->>'productId')::uuid and p.store_id=p_store_id
        and p.active and p.available and c.active for share of p;
    if not found then raise exception 'PRODUCT_UNAVAILABLE' using errcode = 'P0001'; end if;
    v_size_id := nullif(item_json->>'sizeId','')::uuid;
    if exists(select 1 from public.product_sizes ps where ps.product_id=product_row.id and ps.active) then
      select ps.* into size_row from public.product_sizes ps
        where ps.id=v_size_id and ps.product_id=product_row.id and ps.active for share;
      if not found then raise exception 'INVALID_SIZE' using errcode = '22023'; end if;
      v_unit := size_row.price_cents;
    else
      if v_size_id is not null then raise exception 'INVALID_SIZE' using errcode = '22023'; end if;
      v_unit := product_row.base_price_cents;
    end if;
    v_options := item_json->'optionIds';
    if (select count(*) from jsonb_array_elements_text(v_options)) <>
       (select count(distinct value) from jsonb_array_elements_text(v_options)) then
      raise exception 'DUPLICATE_OPTION' using errcode = '22023';
    end if;
    for option_json in select value from jsonb_array_elements(v_options) loop
      select o.id,o.name,o.additional_price_cents,o.option_group_id,g.name as group_name
        into option_row from public.product_options o
        join public.option_groups g on g.id=o.option_group_id and g.store_id=o.store_id
        join public.product_option_relations r on r.option_id=o.id and r.store_id=o.store_id
        where o.id=(option_json #>> '{}')::uuid and r.product_id=product_row.id
          and o.store_id=p_store_id and o.active and g.active for share of o;
      if not found then raise exception 'INVALID_OPTION' using errcode = '22023'; end if;
      v_unit := v_unit + option_row.additional_price_cents;
    end loop;
    for group_row in
      select g.id,g.min_selections,g.max_selections from public.option_groups g
      where g.store_id=p_store_id and g.active and exists (
        select 1 from public.product_options o join public.product_option_relations r on r.option_id=o.id
        where o.option_group_id=g.id and o.active and r.product_id=product_row.id)
    loop
      select count(*) into v_selected from jsonb_array_elements_text(v_options) chosen
        join public.product_options o on o.id=chosen.value::uuid and o.option_group_id=group_row.id;
      if v_selected < group_row.min_selections or v_selected > group_row.max_selections then
        raise exception 'INVALID_OPTION_COUNT' using errcode = '22023';
      end if;
    end loop;
    if v_unit < 1 or v_unit > 100000000 then
      raise exception 'INVALID_TOTAL' using errcode = '22023';
    end if;
    v_subtotal := v_subtotal + v_unit*v_qty;
    if v_subtotal + v_fee > 100000000 then
      raise exception 'INVALID_TOTAL' using errcode = '22023';
    end if;
  end loop;
  if v_subtotal < settings_row.minimum_order_cents then
    raise exception 'MINIMUM_ORDER' using errcode = 'P0001';
  end if;

  insert into public.orders(store_id,customer_name,customer_phone,customer_email,
    order_type,address_snapshot,subtotal_cents,delivery_fee_cents,total_cents,
    payment_method,customer_notes)
  values (p_store_id,btrim(p_customer_name),p_customer_phone,p_customer_email,
    p_order_type,case when p_order_type='delivery' then p_address else null end,
    v_subtotal,v_fee,v_subtotal+v_fee,'mercadopago',p_customer_notes)
  returning id,public_order_number into v_order_id,v_number;

  for item_json in select value from jsonb_array_elements(p_items) loop
    select * into product_row from public.products where id=(item_json->>'productId')::uuid;
    v_size_id := nullif(item_json->>'sizeId','')::uuid;
    if v_size_id is not null then
      select * into size_row from public.product_sizes where id=v_size_id;
      v_unit := size_row.price_cents;
    else v_unit := product_row.base_price_cents; end if;
    v_options := item_json->'optionIds';
    for option_json in select value from jsonb_array_elements(v_options) loop
      select o.id,o.name,o.additional_price_cents,o.option_group_id,g.name as group_name
        into option_row from public.product_options o
        join public.option_groups g on g.id=o.option_group_id
        where o.id=(option_json #>> '{}')::uuid;
      v_unit := v_unit+option_row.additional_price_cents;
    end loop;
    v_qty := (item_json->>'quantity')::integer;
    insert into public.order_items(order_id,product_id,product_name,size_name,quantity,
      unit_price_cents,total_price_cents,notes)
    values(v_order_id,product_row.id,product_row.name,
      case when v_size_id is null then null else size_row.name end,
      v_qty,v_unit,v_unit*v_qty,coalesce(item_json->>'notes','')) returning id into v_item_id;
    for option_json in select value from jsonb_array_elements(v_options) loop
      select o.id,o.name,o.additional_price_cents,g.name as group_name
        into option_row from public.product_options o
        join public.option_groups g on g.id=o.option_group_id
        where o.id=(option_json #>> '{}')::uuid;
      insert into public.order_item_options(order_item_id,option_id,group_name,option_name,price_cents)
      values(v_item_id,option_row.id,option_row.group_name,option_row.name,option_row.additional_price_cents);
    end loop;
  end loop;
  insert into public.payments(order_id,provider,idempotency_key,attempt,amount_cents,
    payment_method,external_reference)
  values(v_order_id,'mercadopago',gen_random_uuid(),1,v_subtotal+v_fee,'mercadopago',v_order_id::text)
  returning id into v_payment_id;
  insert into public.order_events(order_id,event_type,public_message)
  values(v_order_id,'order_created','Pedido criado. Aguardando pagamento.');
  update public.checkout_requests set order_id=v_order_id where id=request_row.id;
  return jsonb_build_object('order_id',v_order_id,'payment_id',v_payment_id,
    'number',v_number,'existing',false);
end;
$$;

create function public.record_checkout_preference(
  p_payment_id uuid,p_provider_order_id text,p_checkout_url text
) returns void language plpgsql security invoker set search_path = '' as $$
begin
  if p_provider_order_id is null or length(p_provider_order_id)>120
     or p_checkout_url !~ '^https://sandbox[.]mercadopago[.]com/' then
    raise exception 'INVALID_PREFERENCE' using errcode = '22023';
  end if;
  update public.payments set provider_order_id=p_provider_order_id,checkout_url=p_checkout_url
    where id=p_payment_id and provider='mercadopago'
      and (provider_order_id is null or provider_order_id=p_provider_order_id);
  if not found then raise exception 'PREFERENCE_CONFLICT' using errcode = '22023'; end if;
end;
$$;

create function public.apply_verified_payment(
  p_event_id text,p_payment_id text,p_external_reference uuid,p_amount_cents integer,
  p_currency text,p_provider_status text,p_method text,p_live_mode boolean
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  payment_row public.payments%rowtype;
  order_row public.orders%rowtype;
  v_status text;
  v_event_id uuid;
begin
  if p_live_mode or length(p_event_id) not between 1 and 180
     or p_payment_id !~ '^[0-9]{1,30}$' or p_currency <> 'BRL'
     or p_provider_status not in ('pending','in_process','authorized','approved',
       'rejected','cancelled','refunded','partially_refunded','charged_back') then
    raise exception 'INVALID_PROVIDER_PAYMENT' using errcode = '22023';
  end if;
  select * into payment_row from public.payments
    where external_reference=p_external_reference::text and provider='mercadopago'
    order by attempt desc limit 1 for update;
  if not found or payment_row.amount_cents<>p_amount_cents then
    raise exception 'PAYMENT_MISMATCH' using errcode = '22023';
  end if;
  select * into order_row from public.orders where id=payment_row.order_id for update;
  if order_row.total_cents<>p_amount_cents then
    raise exception 'PAYMENT_MISMATCH' using errcode = '22023';
  end if;
  insert into public.webhook_events(provider,external_event_id,resource_id,status,attempts,processed_at)
  values('mercadopago',p_event_id,p_payment_id,'processed',1,now())
  on conflict (provider,external_event_id) do nothing returning id into v_event_id;
  if v_event_id is null then
    return jsonb_build_object('order_id',order_row.id,'duplicate',true);
  end if;
  v_status := case p_provider_status
    when 'in_process' then 'processing' when 'authorized' then 'processing'
    else p_provider_status end;
  if payment_row.status='approved' and v_status in ('pending','processing','rejected','cancelled') then
    return jsonb_build_object('order_id',order_row.id,'ignored',true);
  end if;
  update public.payments set provider_payment_id=p_payment_id,status=v_status,
    provider_status=p_provider_status,payment_method=left(p_method,60)
    where id=payment_row.id;
  update public.orders set payment_status=v_status,
    payment_method=case when p_method in ('pix','credit_card','debit_card') then p_method else 'mercadopago' end,
    order_status=case when v_status='approved' and order_status='awaiting_payment' then 'confirmed'
      when v_status in ('rejected','cancelled') and order_status='awaiting_payment' then 'cancelled'
      else order_status end,
    version=version+1 where id=order_row.id;
  insert into public.order_events(order_id,event_type,public_message)
    values(order_row.id,'payment_'||v_status,
      case when v_status='approved' then 'Pagamento confirmado.'
           when v_status in ('pending','processing') then 'Pagamento em análise.'
           else 'Status do pagamento atualizado.' end);
  return jsonb_build_object('order_id',order_row.id,'payment_status',v_status,'duplicate',false);
end;
$$;

revoke all on function public.create_checkout_order(uuid,text,uuid,text,text,text,text,text,text,jsonb,jsonb)
  from public,anon,authenticated;
revoke all on function public.record_checkout_preference(uuid,text,text)
  from public,anon,authenticated;
revoke all on function public.apply_verified_payment(text,text,uuid,integer,text,text,text,boolean)
  from public,anon,authenticated;
grant execute on function public.create_checkout_order(uuid,text,uuid,text,text,text,text,text,text,jsonb,jsonb)
  to service_role;
grant execute on function public.record_checkout_preference(uuid,text,text) to service_role;
grant execute on function public.apply_verified_payment(text,text,uuid,integer,text,text,text,boolean)
  to service_role;

comment on table public.orders is 'Server-only checkout with transactional database pricing. Test store remains disabled until sandbox validation.';
commit;
