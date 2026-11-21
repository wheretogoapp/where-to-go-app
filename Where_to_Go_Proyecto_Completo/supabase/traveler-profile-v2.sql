-- Where to Go | Perfil de viajeros V2
-- Ejecutar una sola vez en Supabase Dashboard > SQL Editor del proyecto configurado.
-- Cada cuenta solo puede leer y escribir SUS propios datos. Nunca usar service_role en cliente.
create table if not exists public.traveler_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null default '{"v":2}'::jsonb,
 updated_at timestamptz not null default now(),
 constraint traveler_profiles_data_is_object check (jsonb_typeof(data)='object'),
 constraint traveler_profiles_data_max check (octet_length(data::text)<150000)
);
alter table public.traveler_profiles enable row level security;
revoke all on public.traveler_profiles from anon;
grant select,insert,update,delete on public.traveler_profiles to authenticated;

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

-- Borrado voluntario de actividad guardada por la propia cuenta.
drop policy if exists "Travelers can delete own activity" on public.activity_events;
create policy "Travelers can delete own activity" on public.activity_events
 for delete to authenticated using (user_id=(select auth.uid()));

-- Datos externos de Google Places no se copian a esta tabla:
-- solo identificadores de lugares, fechas y texto creado por el usuario.
-- Los favoritos existentes siguen en public.favorites y sus políticas RLS.
