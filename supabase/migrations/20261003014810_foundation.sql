-- Foundation only: no public order creation or payment mutation is exposed.
begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create function private.touch_updated_at() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function private.touch_updated_at() from public, anon, authenticated;

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  active boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id),
  name text not null check (length(name) between 1 and 120), slug text not null,
  description text not null default '', image_url text,
  display_order integer not null default 0, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(store_id, slug), unique(id, store_id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id),
  category_id uuid not null, name text not null check (length(name) between 1 and 120), slug text not null,
  description text not null default '' check (length(description) <= 2000), image_url text,
  base_price_cents integer not null check (base_price_cents between 0 and 100000000),
  active boolean not null default true, available boolean not null default true,
  featured boolean not null default false, display_order integer not null default 0,
  tag text not null default '' check (length(tag) <= 60),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(store_id, slug), unique(id, store_id),
  foreign key(category_id,store_id) references public.categories(id,store_id)
);

create table public.product_sizes (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id),
  name text not null, price_cents integer not null check (price_cents between 0 and 100000000),
  active boolean not null default true, display_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(product_id,name), unique(id,product_id)
);

create table public.option_groups (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id),
  name text not null, kind text not null check (kind in ('crust','extra','preparation','flavor')),
  min_selections integer not null default 0 check(min_selections >= 0),
  max_selections integer not null default 1 check(max_selections between 1 and 30),
  active boolean not null default true, check(min_selections <= max_selections),
  unique(id,store_id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_options (
  id uuid primary key default gen_random_uuid(), option_group_id uuid not null,
  store_id uuid not null references public.stores(id), name text not null,
  additional_price_cents integer not null default 0 check(additional_price_cents between 0 and 100000000),
  active boolean not null default true, display_order integer not null default 0,
  unique(id,store_id), unique(id,option_group_id),
  foreign key(option_group_id,store_id) references public.option_groups(id,store_id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_option_relations (
  product_id uuid not null, option_id uuid not null, store_id uuid not null,
  primary key(product_id,option_id),
  foreign key(product_id,store_id) references public.products(id,store_id),
  foreign key(option_id,store_id) references public.product_options(id,store_id)
);

create table public.store_settings (
  store_id uuid primary key references public.stores(id), timezone text not null default 'America/Sao_Paulo',
  phone text not null default '', whatsapp text not null default '', address text not null default '',
  minimum_order_cents integer not null default 0 check(minimum_order_cents >= 0),
  estimated_minutes integer not null default 40 check(estimated_minutes between 1 and 240),
  ordering_enabled boolean not null default false,
  pickup_enabled boolean not null default false, delivery_enabled boolean not null default false,
  pix_enabled boolean not null default false, card_enabled boolean not null default false,
  cash_enabled boolean not null default false,
  opening_override text not null default 'closed' check(opening_override in ('schedule','open','closed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.store_hours (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id),
  weekday smallint not null check(weekday between 0 and 6), opens_at time not null, closes_at time not null,
  closes_next_day boolean not null default false,
  check(closes_next_day or closes_at > opens_at), unique(store_id,weekday,opens_at)
);
create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id),
  name text not null, cep_start text not null check(cep_start ~ '^[0-9]{8}$'),
  cep_end text not null check(cep_end ~ '^[0-9]{8}$'), city text not null, state char(2) not null,
  fee_cents integer not null check(fee_cents between 0 and 100000000), active boolean not null default false,
  check(cep_start <= cep_end),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.staff_members (
  user_id uuid not null references auth.users(id) on delete cascade,
  store_id uuid not null references public.stores(id), role text not null default 'ADMIN' check(role in ('ADMIN','MANAGER','ATTENDANT','KITCHEN','COURIER')),
  active boolean not null default true, created_at timestamptz not null default now(), primary key(user_id,store_id)
);
create table public.customers (
  id uuid primary key default gen_random_uuid(), auth_user_id uuid references auth.users(id) on delete set null,
  name text not null check(length(name) between 2 and 120), phone text not null, email text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.customers(id),
  cep text not null check(cep ~ '^[0-9]{8}$'), street text not null, number text not null,
  complement text not null default '', neighborhood text not null, city text not null, state char(2) not null,
  reference text not null default '', created_at timestamptz not null default now()
);
create table public.orders (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references public.stores(id),
  public_order_number bigint generated always as identity unique,
  customer_id uuid references public.customers(id), customer_name text not null, customer_phone text not null, customer_email text,
  order_type text not null check(order_type in ('delivery','pickup')),
  address_snapshot jsonb, subtotal_cents integer not null check(subtotal_cents between 0 and 100000000),
  delivery_fee_cents integer not null default 0 check(delivery_fee_cents between 0 and 100000000),
  discount_cents integer not null default 0 check(discount_cents >= 0),
  total_cents integer not null check(total_cents between 0 and 100000000), currency text not null default 'BRL' check(currency='BRL'),
  payment_method text not null check(payment_method in ('pix','credit_card','debit_card','cash','card_on_delivery')),
  payment_status text not null default 'pending' check(payment_status in ('pending','processing','approved','rejected','refunded','partially_refunded','cancelled','charged_back')),
  order_status text not null default 'awaiting_payment' check(order_status in ('awaiting_payment','confirmed','preparing','ready','out_for_delivery','delivered','cancelled')),
  customer_notes text not null default '' check(length(customer_notes)<=1000), internal_notes text not null default '',
  version integer not null default 1 check(version>0),
  check(discount_cents <= subtotal_cents), check(total_cents=subtotal_cents+delivery_fee_cents-discount_cents),
  check(order_type <> 'pickup' or delivery_fee_cents=0),
  check(order_type <> 'delivery' or (address_snapshot is not null and jsonb_typeof(address_snapshot)='object')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id),
  product_id uuid references public.products(id), product_name text not null, size_name text,
  quantity integer not null check(quantity between 1 and 99), unit_price_cents integer not null check(unit_price_cents between 0 and 100000000),
  total_price_cents integer not null check(total_price_cents between 0 and 100000000),
  notes text not null default '' check(length(notes)<=500), check(total_price_cents::bigint=unit_price_cents::bigint*quantity)
);
create table public.order_item_options (
  id uuid primary key default gen_random_uuid(), order_item_id uuid not null references public.order_items(id),
  option_id uuid references public.product_options(id), group_name text not null, option_name text not null,
  quantity integer not null default 1 check(quantity between 1 and 30), price_cents integer not null check(price_cents between 0 and 100000000)
);
create table public.payments (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id),
  provider text not null check(provider in ('mercadopago','local')), provider_order_id text, provider_payment_id text,
  idempotency_key uuid not null unique, attempt integer not null check(attempt>0),
  amount_cents integer not null check(amount_cents between 1 and 100000000), currency text not null default 'BRL' check(currency='BRL'),
  status text not null default 'pending' check(status in ('pending','processing','approved','rejected','refunded','partially_refunded','cancelled','charged_back')),
  payment_method text not null, external_reference text not null, provider_status text,
  expires_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(order_id,attempt), unique(provider,provider_payment_id), unique(provider,provider_order_id)
);
create table public.order_events (
  id bigint generated always as identity primary key, order_id uuid not null references public.orders(id),
  event_type text not null, actor_id uuid references auth.users(id), public_message text,
  created_at timestamptz not null default now()
);
create table public.order_access_tokens (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id),
  token_hash text not null unique check(token_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null, revoked_at timestamptz, created_at timestamptz not null default now()
);
create table public.checkout_requests (
  id uuid primary key default gen_random_uuid(), session_hash text not null,
  idempotency_key uuid not null, payload_hash text not null, order_id uuid references public.orders(id),
  created_at timestamptz not null default now(), unique(session_hash,idempotency_key)
);
create table public.webhook_events (
  id uuid primary key default gen_random_uuid(), provider text not null, external_event_id text not null,
  resource_id text not null, status text not null default 'received' check(status in ('received','processing','processed','failed')),
  attempts integer not null default 0 check(attempts>=0), next_retry_at timestamptz,
  received_at timestamptz not null default now(), processed_at timestamptz, unique(provider,external_event_id)
);

create index categories_store_order_idx on public.categories(store_id,display_order);
create index products_category_idx on public.products(category_id,store_id);
create index products_store_order_idx on public.products(store_id,display_order) where active;
create index sizes_product_idx on public.product_sizes(product_id);
create index option_groups_store_idx on public.option_groups(store_id);
create index options_group_idx on public.product_options(option_group_id,store_id);
create index options_store_idx on public.product_options(store_id);
create index relations_option_idx on public.product_option_relations(option_id,store_id);
create index relations_store_idx on public.product_option_relations(store_id);
create index zones_store_idx on public.delivery_zones(store_id,cep_start,cep_end);
create index staff_store_idx on public.staff_members(store_id);
create index customers_auth_idx on public.customers(auth_user_id);
create index addresses_customer_idx on public.customer_addresses(customer_id);
create index orders_store_status_idx on public.orders(store_id,order_status,created_at desc);
create index orders_customer_idx on public.orders(customer_id);
create index items_order_idx on public.order_items(order_id);
create index items_product_idx on public.order_items(product_id);
create index item_options_item_idx on public.order_item_options(order_item_id);
create index item_options_option_idx on public.order_item_options(option_id);
create index events_order_idx on public.order_events(order_id,id);
create index events_actor_idx on public.order_events(actor_id);
create index tokens_order_idx on public.order_access_tokens(order_id);
create index requests_order_idx on public.checkout_requests(order_id);
create index webhook_retry_idx on public.webhook_events(next_retry_at) where status in ('received','failed');

-- Do not rely on Supabase's default privileges. Private tables stay denied even
-- to ordinary authenticated users; future admin actions require explicit design.
do $$
declare t text;
begin
  foreach t in array array['stores','categories','products','product_sizes','option_groups','product_options','product_option_relations','store_settings','store_hours','delivery_zones','staff_members','customers','customer_addresses','orders','order_items','order_item_options','payments','order_events','order_access_tokens','checkout_requests','webhook_events'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on table public.%I from public, anon, authenticated',t);
    execute format('grant all on table public.%I to service_role',t);
    if exists(select 1 from information_schema.columns where table_schema='public' and table_name=t and column_name='updated_at') then
      execute format('create trigger touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()',t);
    end if;
  end loop;
end $$;
grant usage on schema public to anon, authenticated, service_role;
grant usage on schema private to service_role;
grant execute on function private.touch_updated_at() to service_role;
revoke all on sequence public.orders_public_order_number_seq, public.order_events_id_seq from public,anon,authenticated;
grant usage,select on sequence public.orders_public_order_number_seq, public.order_events_id_seq to service_role;
grant select on public.stores, public.categories, public.products, public.product_sizes,
 public.option_groups, public.product_options, public.product_option_relations,
 public.store_settings, public.store_hours, public.delivery_zones to anon,authenticated;
grant select on public.staff_members to authenticated;

create policy stores_read on public.stores for select to anon,authenticated using(active);
create policy categories_read on public.categories for select to anon,authenticated using(active and exists(select 1 from public.stores s where s.id=store_id));
create policy products_read on public.products for select to anon,authenticated using(active and exists(select 1 from public.categories c where c.id=category_id));
create policy sizes_read on public.product_sizes for select to anon,authenticated using(active and exists(select 1 from public.products p where p.id=product_id));
create policy groups_read on public.option_groups for select to anon,authenticated using(active and exists(select 1 from public.stores s where s.id=store_id));
create policy options_read on public.product_options for select to anon,authenticated using(active and exists(select 1 from public.option_groups g where g.id=option_group_id));
create policy relations_read on public.product_option_relations for select to anon,authenticated using(exists(select 1 from public.products p where p.id=product_id) and exists(select 1 from public.product_options o where o.id=option_id));
create policy settings_read on public.store_settings for select to anon,authenticated using(exists(select 1 from public.stores s where s.id=store_id));
create policy hours_read on public.store_hours for select to anon,authenticated using(exists(select 1 from public.stores s where s.id=store_id));
create policy zones_read on public.delivery_zones for select to anon,authenticated using(active and exists(select 1 from public.stores s where s.id=store_id));
create policy staff_read_own on public.staff_members for select to authenticated using(user_id=(select auth.uid()));

comment on table public.orders is 'Foundation only. Writes restricted to server. Transactional pricing/order service required before enabling checkout.';
commit;
