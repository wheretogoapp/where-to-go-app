-- WHERE TO GO V4 · SUPABASE
-- Ejecuta en SQL Editor del proyecto de Supabase, una sola vez.
-- Nunca publiques la service_role key en HTML o JavaScript.
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 personalization_opt_in boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.favorites (
 user_id uuid not null references auth.users(id) on delete cascade,
 place_id text not null,
 created_at timestamptz not null default now(),
 primary key (user_id, place_id)
);
create table if not exists public.activity_events (
 id bigint generated always as identity primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 event_type text not null check (event_type in ('view','favorite')),
 place_id text not null,
 category text not null,
 created_at timestamptz not null default now()
);
create index if not exists activity_events_user_time_idx on public.activity_events (user_id,created_at desc);
alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.activity_events enable row level security;

drop policy if exists "profiles own select" on public.profiles;
create policy "profiles own select" on public.profiles for select to authenticated using (id = (select auth.uid()));
drop policy if exists "profiles own insert" on public.profiles;
create policy "profiles own insert" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own update" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "favorites own select" on public.favorites;
create policy "favorites own select" on public.favorites for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "favorites own insert" on public.favorites;
create policy "favorites own insert" on public.favorites for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists "favorites own delete" on public.favorites;
create policy "favorites own delete" on public.favorites for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists "events own select" on public.activity_events;
create policy "events own select" on public.activity_events for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "events own insert with consent" on public.activity_events;
create policy "events own insert with consent" on public.activity_events for insert to authenticated
 with check (user_id = (select auth.uid()) and exists (
 select 1 from public.profiles p where p.id=(select auth.uid()) and p.personalization_opt_in=true));
drop policy if exists "events own delete" on public.activity_events;
create policy "events own delete" on public.activity_events for delete to authenticated using (user_id = (select auth.uid()));

-- Preparado para una posterior ingestión periódica de lugares verificados.
-- Esta tabla NO se llena automáticamente; no inventes fichas ni números.
create table if not exists public.places (
 id text primary key,
 name text not null,
 province text not null,
 municipality text,
 category text not null,
 latitude double precision,
 longitude double precision,
 phone text,
 source_url text not null,
 source_name text not null,
 source_verified_at timestamptz,
 verification_state text not null default 'pending' check (verification_state in ('pending','verified','rejected')),
 created_at timestamptz not null default now()
);
alter table public.places enable row level security;
drop policy if exists "public verified places only" on public.places;
create policy "public verified places only" on public.places for select to anon,authenticated using (verification_state='verified');
-- Escritura: solo con un servicio backend seguro mediante una clave privada (no exponer).
