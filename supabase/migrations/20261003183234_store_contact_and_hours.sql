-- Dados comerciais informados para a unidade de homologação em Lídice.
begin;
update public.stores
set name = 'Pizzaria Nuclear — Lídice (homologação)'
where id = '10000000-0000-4000-8000-000000000001' and slug = 'nuclear-homologacao';
update public.store_settings
set phone = '(24) 99919-2282',
    whatsapp = '5524999192282',
    address = 'Rod. Saturnino Braga, 1051 - Centro, Lídice, Rio Claro - RJ'
where store_id = '10000000-0000-4000-8000-000000000001';
insert into public.store_hours(store_id,weekday,opens_at,closes_at,closes_next_day)
select '10000000-0000-4000-8000-000000000001', day, '17:00:00', '23:00:00', false
from generate_series(0,6) as day
on conflict (store_id,weekday,opens_at) do nothing;
commit;
