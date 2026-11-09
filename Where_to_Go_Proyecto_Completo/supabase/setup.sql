-- Where to Go: ejecutar UNA vez en Supabase Dashboard > SQL Editor.
-- No introducir claves secretas en GitHub ni en el navegador.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  personalization_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id,place_id)
);
alter table public.favorites enable row level security;
drop policy if exists "Users manage own favorites" on public.favorites;
create policy "Users manage own favorites" on public.favorites for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create table if not exists public.activity_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  place_id text,
  category text,
  created_at timestamptz not null default now()
);
alter table public.activity_events enable row level security;
drop policy if exists "Users insert own activity" on public.activity_events;
create policy "Users insert own activity" on public.activity_events for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users read own activity" on public.activity_events;
create policy "Users read own activity" on public.activity_events for select to authenticated using ((select auth.uid()) = user_id);

-- Archivos de excursiones privados hasta revisión y aprobación.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('tour-submissions','tour-submissions',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "Authenticated users upload own tour images" on storage.objects;
create policy "Authenticated users upload own tour images" on storage.objects
for insert to authenticated
with check (bucket_id='tour-submissions' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists "Authenticated users read own tour images" on storage.objects;
create policy "Authenticated users read own tour images" on storage.objects
for select to authenticated
using (bucket_id='tour-submissions' and (storage.foldername(name))[1]=(select auth.uid())::text);
-- No public read, no direct client delete/update; moderation via trusted backend only.
