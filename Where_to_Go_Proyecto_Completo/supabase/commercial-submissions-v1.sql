-- Where to Go | Prioridad 1 y 2 | Solicitudes verificables y privadas.
-- Ejecutar MANUALMENTE en Supabase SQL Editor tras revisar schema.sql y traveler-profile-v2.sql.
-- No contiene ni requiere claves secretas. No activa cobros ni publica negocios.
-- Sólo usuarios con sesión pueden enviar solicitudes; sólo el mismo usuario
-- las puede consultar. La aprobación y los pagos se hacen por un administrador
-- con backend seguro y nunca desde la clave pública del navegador.

create table if not exists public.business_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  plan text not null check (plan in ('basico','destacado','premium')),
  details jsonb not null,
  status text not null default 'pending' check (status in ('pending','reviewing','approved','rejected','cancelled')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint business_submission_details_object check (jsonb_typeof(details) = 'object'),
  constraint business_submission_details_size check (octet_length(details::text) <= 12000)
);
create index if not exists business_submissions_owner_time_idx
  on public.business_submissions (user_id, created_at desc);
alter table public.business_submissions enable row level security;
revoke all on public.business_submissions from anon;
grant select,insert on public.business_submissions to authenticated;
drop policy if exists "Business owners read their submissions" on public.business_submissions;
create policy "Business owners read their submissions" on public.business_submissions
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Business owners submit requests" on public.business_submissions;
create policy "Business owners submit requests" on public.business_submissions
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and reviewed_at is null
  );

create table if not exists public.tour_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  details jsonb not null,
  photo_paths text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','reviewing','approved','rejected','cancelled')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint tour_submission_details_object check (jsonb_typeof(details) = 'object'),
  constraint tour_submission_details_size check (octet_length(details::text) <= 12000),
  constraint tour_submission_photo_count check (cardinality(photo_paths) between 1 and 5)
);
create index if not exists tour_submissions_owner_time_idx
  on public.tour_submissions (user_id, created_at desc);
alter table public.tour_submissions enable row level security;
revoke all on public.tour_submissions from anon;
grant select,insert on public.tour_submissions to authenticated;
drop policy if exists "Tour organizers read their submissions" on public.tour_submissions;
create policy "Tour organizers read their submissions" on public.tour_submissions
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "Tour organizers submit requests" on public.tour_submissions;
create policy "Tour organizers submit requests" on public.tour_submissions
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and reviewed_at is null
    and (select coalesce(bool_and(uploaded.path like ((select auth.uid())::text || '/%')), false)
         from unnest(photo_paths) as uploaded(path))
  );

-- Private bucket: applicants cannot browse another organizer's photos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wtg-tour-applications','wtg-tour-applications',false,5242880,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Tour applicants upload their own private photos" on storage.objects;
create policy "Tour applicants upload their own private photos" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'wtg-tour-applications'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
drop policy if exists "Tour applicants read their own private photos" on storage.objects;
create policy "Tour applicants read their own private photos" on storage.objects
  for select to authenticated using (
    bucket_id = 'wtg-tour-applications'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
drop policy if exists "Tour applicants remove their own private photos" on storage.objects;
create policy "Tour applicants remove their own private photos" on storage.objects
  for delete to authenticated using (
    bucket_id = 'wtg-tour-applications'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Corrections and authorized place photos are also private, not Netlify-only.
create table if not exists public.place_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  details jsonb not null,
  photo_path text,
  status text not null default 'pending' check (status in ('pending','reviewing','accepted','rejected')),
  created_at timestamptz not null default now(),
  constraint place_report_details_object check (jsonb_typeof(details)='object'),
  constraint place_report_details_limit check (octet_length(details::text)<=12000)
);
create index if not exists place_reports_owner_time_idx on public.place_reports(user_id,created_at desc);
alter table public.place_reports enable row level security;
revoke all on public.place_reports from anon;
grant select,insert on public.place_reports to authenticated;
drop policy if exists "Travelers see own place reports" on public.place_reports;
create policy "Travelers see own place reports" on public.place_reports
  for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists "Travelers send own place reports" on public.place_reports;
create policy "Travelers send own place reports" on public.place_reports
  for insert to authenticated with check (
    user_id=(select auth.uid()) and status='pending'
    and (photo_path is null or photo_path like ((select auth.uid())::text||'/%'))
  );
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('wtg-place-reports','wtg-place-reports',false,6291456,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
 public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Traveler uploads own report photo" on storage.objects;
create policy "Traveler uploads own report photo" on storage.objects
  for insert to authenticated with check (
    bucket_id='wtg-place-reports' and
    (storage.foldername(name))[1]=(select auth.uid())::text
  );
drop policy if exists "Traveler reads own report photo" on storage.objects;
create policy "Traveler reads own report photo" on storage.objects
  for select to authenticated using (
    bucket_id='wtg-place-reports' and
    (storage.foldername(name))[1]=(select auth.uid())::text
  );
drop policy if exists "Traveler deletes own report photo" on storage.objects;
create policy "Traveler deletes own report photo" on storage.objects
  for delete to authenticated using (
    bucket_id='wtg-place-reports' and
    (storage.foldername(name))[1]=(select auth.uid())::text
  );

-- User-visible account deletion request; administrator processing is still required.
-- A request does not itself delete auth.users (requires a protected server action).
create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','processing','completed','rejected')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists account_deletion_owner_time_idx
  on public.account_deletion_requests (user_id, created_at desc);
alter table public.account_deletion_requests enable row level security;
revoke all on public.account_deletion_requests from anon;
grant select,insert on public.account_deletion_requests to authenticated;
drop policy if exists "People can see their deletion request" on public.account_deletion_requests;
create policy "People can see their deletion request" on public.account_deletion_requests
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "People may request deletion" on public.account_deletion_requests;
create policy "People may request deletion" on public.account_deletion_requests
  for insert to authenticated with check (
    user_id = (select auth.uid()) and status = 'pending' and completed_at is null
  );

-- Admin review, payment verification, support response and completed deletion:
-- intentionally NOT available via authenticated browser writes.
