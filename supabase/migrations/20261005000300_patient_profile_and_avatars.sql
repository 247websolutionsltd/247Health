alter table public.profiles
  add column if not exists blood_type text,
  add column if not exists allergies text,
  add column if not exists avatar_path text,
  add column if not exists patient_details_completed_at timestamptz;

alter table public.profiles
  add constraint profiles_blood_type_valid
  check (blood_type is null or blood_type in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'));

alter table public.profiles
  add constraint profiles_allergies_length
  check (allergies is null or char_length(allergies) <= 2000);

alter table public.profiles
  add constraint profiles_avatar_path_owner_scoped
  check (avatar_path is null or avatar_path like id::text || '/%');

grant update (blood_type, allergies, avatar_path, patient_details_completed_at)
  on public.profiles to authenticated;
grant insert (blood_type, allergies, avatar_path, patient_details_completed_at)
  on public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists profile_photos_select_own on storage.objects;
create policy profile_photos_select_own
  on storage.objects for select to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists profile_photos_insert_own on storage.objects;
create policy profile_photos_insert_own
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists profile_photos_update_own on storage.objects;
create policy profile_photos_update_own
  on storage.objects for update to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );