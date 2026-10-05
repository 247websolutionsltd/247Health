create schema if not exists extensions;
create extension if not exists btree_gist with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create type public.consultation_type as enum ('in_person', 'video_call');
create type public.appointment_status as enum ('confirmed', 'completed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint profiles_full_name_length check (full_name is null or char_length(full_name) <= 160),
  constraint profiles_phone_length check (phone is null or char_length(phone) <= 32)
);

create table public.specialties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint specialties_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint specialties_name_length check (char_length(name) between 1 and 80)
);

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  specialty_id uuid not null references public.specialties (id) on delete restrict,
  full_name text not null,
  clinic_name text not null,
  rating numeric(2, 1) not null default 0,
  review_count integer not null default 0,
  years_experience smallint not null default 0,
  consultation_fee_minor integer not null,
  currency_code text not null,
  biography text not null default '',
  is_bookable boolean not null default false,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint doctors_name_length check (char_length(full_name) between 1 and 160),
  constraint doctors_clinic_name_length check (char_length(clinic_name) between 1 and 160),
  constraint doctors_biography_length check (char_length(biography) <= 4000),
  constraint doctors_rating_range check (rating between 0 and 5),
  constraint doctors_review_count_nonnegative check (review_count >= 0),
  constraint doctors_experience_nonnegative check (years_experience >= 0),
  constraint doctors_fee_nonnegative check (consultation_fee_minor >= 0),
  constraint doctors_currency_code_format check (currency_code ~ '^[A-Z]{3}$')
);

create table public.doctor_slots (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors (id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_available boolean not null default true,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint doctor_slots_valid_range check (ends_at > starts_at),
  constraint doctor_slots_no_overlap exclude using gist (
    doctor_id extensions.gist_uuid_ops with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users (id) on delete cascade,
  slot_id uuid not null references public.doctor_slots (id) on delete restrict,
  consultation_type public.consultation_type not null,
  reason_for_visit text,
  status public.appointment_status not null default 'confirmed',
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint appointments_reason_length check (
    reason_for_visit is null or char_length(reason_for_visit) <= 2000
  )
);

create index doctors_specialty_id_idx on public.doctors (specialty_id);
create index doctors_full_name_trgm_idx
  on public.doctors using gin (full_name extensions.gin_trgm_ops);
create index doctors_clinic_name_trgm_idx
  on public.doctors using gin (clinic_name extensions.gin_trgm_ops);
create index doctor_slots_available_start_idx
  on public.doctor_slots (doctor_id, starts_at)
  where is_available;
create unique index appointments_one_confirmed_per_slot_idx
  on public.appointments (slot_id)
  where status = 'confirmed';
create index appointments_patient_status_created_idx
  on public.appointments (patient_id, status, created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger specialties_set_updated_at
before update on public.specialties
for each row execute function public.set_updated_at();

create trigger doctors_set_updated_at
before update on public.doctors
for each row execute function public.set_updated_at();

create trigger doctor_slots_set_updated_at
before update on public.doctor_slots
for each row execute function public.set_updated_at();

create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

create function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    nullif(pg_catalog.btrim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')), ''),
    nullif(pg_catalog.btrim(coalesce(new.phone, new.raw_user_meta_data ->> 'phone')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create function public.sync_slot_availability_from_appointment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.doctor_slots
    set is_available = false
    where id = new.slot_id;
    return new;
  end if;

  if old.status is distinct from new.status then
    update public.doctor_slots
    set is_available = (new.status = 'cancelled' and starts_at > pg_catalog.now())
    where id = new.slot_id;
  end if;
  return new;
end;
$$;

create trigger appointments_sync_slot_after_insert
after insert on public.appointments
for each row execute function public.sync_slot_availability_from_appointment();

create trigger appointments_sync_slot_after_status_update
after update of status on public.appointments
for each row execute function public.sync_slot_availability_from_appointment();

alter table public.profiles enable row level security;
alter table public.specialties enable row level security;
alter table public.doctors enable row level security;
alter table public.doctor_slots enable row level security;
alter table public.appointments enable row level security;

create policy profiles_select_own
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy profiles_insert_own
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy profiles_update_own
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy specialties_read_public
  on public.specialties for select to anon, authenticated
  using (true);
create policy doctors_read_public
  on public.doctors for select to anon, authenticated
  using (true);
create policy doctor_slots_read_open_future
  on public.doctor_slots for select to anon, authenticated
  using (
    is_available
    and starts_at > pg_catalog.statement_timestamp()
    and exists (
      select 1
      from public.doctors as doctor
      where doctor.id = doctor_id
        and doctor.is_bookable
    )
  );

create policy appointments_select_own
  on public.appointments for select to authenticated
  using ((select auth.uid()) = patient_id);
create policy appointments_insert_own_open_slot
  on public.appointments for insert to authenticated
  with check (
    (select auth.uid()) = patient_id
    and status = 'confirmed'
    and exists (
      select 1
      from public.doctor_slots as slot
      where slot.id = slot_id
        and slot.is_available
        and slot.starts_at > pg_catalog.statement_timestamp()
    )
  );
create policy appointments_cancel_own
  on public.appointments for update to authenticated
  using ((select auth.uid()) = patient_id and status = 'confirmed')
  with check ((select auth.uid()) = patient_id and status = 'cancelled');

revoke all on table public.profiles, public.specialties, public.doctors,
  public.doctor_slots, public.appointments from anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.create_profile_for_new_user() from public, anon, authenticated;
revoke all on function public.sync_slot_availability_from_appointment() from public, anon, authenticated;

grant usage on schema public to anon, authenticated;
grant usage on type public.consultation_type, public.appointment_status to authenticated;
grant select on table public.specialties, public.doctors to anon, authenticated;
grant select on table public.doctor_slots to anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (id, full_name, phone) on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;
grant select on table public.appointments to authenticated;
grant insert (patient_id, slot_id, consultation_type, reason_for_visit)
  on public.appointments to authenticated;
grant update (status) on public.appointments to authenticated;