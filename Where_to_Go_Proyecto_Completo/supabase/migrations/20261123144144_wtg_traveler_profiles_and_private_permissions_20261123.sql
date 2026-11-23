-- Where to Go · Migration applied to Supabase project byrwnxpxfzharmydpbka on 2026-11-23
-- Private traveler profiles and consent-gated activity, preserving existing user data.
create table if not exists public.traveler_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null default '{"v":2}'::jsonb,
 updated_at timestamptz not null default now(),
 constraint traveler_profiles_data_is_object check (jsonb_typeof(data)='object'),
 constraint traveler_profiles_data_max check (octet_length(data::text)<150000)
);
alter table public.traveler_profiles enable row level security;
drop policy if exists "Travelers can read own saved profile" on public.traveler_profiles;
create policy "Travelers can read own saved profile" on public.traveler_profiles
 for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists "Travelers can create own saved profile" on public.traveler_profiles;
create policy "Travelers can create own saved profile" on public.traveler_profiles
 for insert to authenticated with check (user_id=(select auth.uid()));
drop policy if exists "Travelers can edit own saved profile" on public.traveler_profiles;
create policy "Travelers can edit own saved profile" on public.traveler_profiles
 for update to authenticated using (user_id=(select auth.uid()))
 with check (user_id=(select auth.uid()));
drop policy if exists "Travelers can delete own saved profile" on public.traveler_profiles;
create policy "Travelers can delete own saved profile" on public.traveler_profiles
 for delete to authenticated using (user_id=(select auth.uid()));
drop policy if exists "Users insert own activity" on public.activity_events;
drop policy if exists "events own insert with consent" on public.activity_events;
create policy "events own insert with consent" on public.activity_events
 for insert to authenticated
 with check (user_id=(select auth.uid()) and exists (
   select 1 from public.profiles p
   where p.id=(select auth.uid()) and p.personalization_opt_in=true
 ));
drop policy if exists "Travelers can delete own activity" on public.activity_events;
create policy "Travelers can delete own activity" on public.activity_events
 for delete to authenticated using (user_id=(select auth.uid()));
create index if not exists activity_events_user_time_idx on public.activity_events (user_id,created_at desc);
revoke all on public.profiles,public.favorites,public.activity_events,public.traveler_profiles from anon;
revoke all on public.profiles,public.favorites,public.activity_events,public.traveler_profiles from authenticated;
grant select,insert,update on public.profiles to authenticated;
grant select,insert,update,delete on public.favorites to authenticated;
grant select,insert,delete on public.activity_events to authenticated;
grant select,insert,update,delete on public.traveler_profiles to authenticated;
insert into public.profiles (id,personalization_opt_in)
 select id,false from auth.users on conflict (id) do nothing;
