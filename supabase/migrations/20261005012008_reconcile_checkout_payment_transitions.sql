begin;

create or replace function public.apply_verified_payment(
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

  -- Once an attempt is approved, only that payment may change its state.
  if payment_row.provider_payment_id is not null
     and payment_row.provider_payment_id<>p_payment_id
     and payment_row.status in ('approved','refunded','partially_refunded','charged_back') then
    return jsonb_build_object('order_id',order_row.id,'ignored',true);
  end if;
  if payment_row.status='approved'
     and v_status in ('pending','processing','rejected','cancelled') then
    return jsonb_build_object('order_id',order_row.id,'ignored',true);
  end if;
  if payment_row.status in ('refunded','partially_refunded','charged_back')
     and v_status in ('pending','processing','approved','rejected','cancelled') then
    return jsonb_build_object('order_id',order_row.id,'ignored',true);
  end if;

  update public.payments set provider_payment_id=p_payment_id,status=v_status,
    provider_status=p_provider_status,payment_method=left(p_method,60)
    where id=payment_row.id;
  update public.orders set payment_status=v_status,
    payment_method=case when p_method in ('pix','credit_card','debit_card') then p_method else 'mercadopago' end,
    order_status=case
      when v_status='approved' and order_status in ('awaiting_payment','cancelled') then 'confirmed'
      when v_status in ('pending','processing') and order_status='cancelled'
        and payment_row.status in ('rejected','cancelled') then 'awaiting_payment'
      when v_status in ('rejected','cancelled') and order_status='awaiting_payment' then 'cancelled'
      else order_status end,
    version=version+1 where id=order_row.id;
  insert into public.order_events(order_id,event_type,public_message)
    values(order_row.id,'payment_'||v_status,
      case when v_status='approved' then 'Pagamento confirmado.'
           when v_status in ('pending','processing') then 'Pagamento em analise.'
           else 'Status do pagamento atualizado.' end);
  return jsonb_build_object('order_id',order_row.id,'payment_status',v_status,'duplicate',false);
end;
$$;

commit;
