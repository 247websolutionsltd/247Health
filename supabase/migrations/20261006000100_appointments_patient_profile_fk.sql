insert into public.profiles (id, full_name, phone)
select
  auth_user.id,
  nullif(pg_catalog.btrim(coalesce(auth_user.raw_user_meta_data ->> 'full_name', auth_user.raw_user_meta_data ->> 'name')), ''),
  nullif(pg_catalog.btrim(coalesce(auth_user.phone, auth_user.raw_user_meta_data ->> 'phone')), '')
from auth.users as auth_user
on conflict (id) do nothing;

alter table public.appointments
  drop constraint if exists appointments_patient_id_fkey;

alter table public.appointments
  add constraint appointments_patient_id_fkey
  foreign key (patient_id)
  references public.profiles (id)
  on delete cascade;