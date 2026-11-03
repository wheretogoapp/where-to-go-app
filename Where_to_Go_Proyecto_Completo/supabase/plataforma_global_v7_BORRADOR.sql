-- WHERE TO GO | esquema de crecimiento mundial
-- BORRADOR PARA UN FUTURO BACKEND: no ejecutar sin revisión y copias.
-- No habilita pagos, autenticación ni fotos automáticamente.
-- Se ejecutaría DESPUÉS de configurar Supabase y la identidad de administradores.
-- RLS restrictiva: el dueño propone una ficha; solo backend/admin publica.

create table if not exists public.wtg_business_applications (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 country_code text not null check(country_code ~ '^[A-Z]{2}$'),
 region_name text not null,
 city_name text not null,
 name text not null check(length(trim(name)) between 2 and 130),
 category text not null,
 address text,
 latitude double precision check(latitude between -90 and 90),
 longitude double precision check(longitude between -180 and 180),
 phone text,
 website text,
 proposed_photo_url text,
 photo_rights_confirmed boolean not null default false,
 proposed_plan text not null default 'basic' check(proposed_plan in ('basic','featured','premium')),
 review_status text not null default 'pending' check(review_status in ('pending','approved','rejected')),
 review_notes text,
 submitted_at timestamptz not null default now()
);
create index if not exists wtg_applications_owner_idx on public.wtg_business_applications(owner_id,submitted_at desc);
alter table public.wtg_business_applications enable row level security;
drop policy if exists "wtg applicants read own" on public.wtg_business_applications;
create policy "wtg applicants read own" on public.wtg_business_applications for select to authenticated using(owner_id = (select auth.uid()));
drop policy if exists "wtg applicants submit own" on public.wtg_business_applications;
create policy "wtg applicants submit own" on public.wtg_business_applications for insert to authenticated
 with check(owner_id=(select auth.uid()) and review_status='pending' and review_notes is null);
-- Deliberadamente no hay UPDATE/DELETE para dueños: no pueden aprobarse a sí mismos.

create table if not exists public.wtg_published_businesses (
 id uuid primary key default gen_random_uuid(),
 source_application_id uuid unique references public.wtg_business_applications(id),
 country_code text not null check(country_code ~ '^[A-Z]{2}$'),
 region_name text not null,
 city_name text not null,
 name text not null,
 category text not null,
 address text,
 latitude double precision check(latitude between -90 and 90),
 longitude double precision check(longitude between -180 and 180),
 phone text,
 website text,
 description text,
 photo_url text,
 photo_credit text,
 photo_license text,
 plan text not null default 'basic' check(plan in ('basic','featured','premium')),
 payment_verified boolean not null default false,
 owner_editorial boolean not null default false,
 sponsor_until timestamptz,
 published boolean not null default false,
 checked_at timestamptz,
 updated_at timestamptz not null default now()
);
create index if not exists wtg_businesses_geo_idx on public.wtg_published_businesses(country_code,region_name,category,published);
alter table public.wtg_published_businesses enable row level security;
drop policy if exists "wtg public published only" on public.wtg_published_businesses;
create policy "wtg public published only" on public.wtg_published_businesses for select to anon,authenticated
 using(published=true and (plan='basic' or (payment_verified=true and sponsor_until>now()) or owner_editorial=true));
-- Solo un servicio administrador con credenciales privadas puede INSERT/UPDATE/DELETE.

create table if not exists public.wtg_photo_submissions (
 id uuid primary key default gen_random_uuid(),
 contributor_id uuid not null references auth.users(id) on delete cascade,
 business_id uuid references public.wtg_published_businesses(id),
 external_place_id text,
 photo_url text not null,
 confirms_rights boolean not null default false,
 license_description text,
 review_status text not null default 'pending' check(review_status in ('pending','approved','rejected')),
 submitted_at timestamptz not null default now(),
 check(business_id is not null or nullif(external_place_id,'') is not null)
);
alter table public.wtg_photo_submissions enable row level security;
drop policy if exists "wtg contributor reads own" on public.wtg_photo_submissions;
create policy "wtg contributor reads own" on public.wtg_photo_submissions for select to authenticated using(contributor_id=(select auth.uid()));
drop policy if exists "wtg contributor proposes photo" on public.wtg_photo_submissions;
create policy "wtg contributor proposes photo" on public.wtg_photo_submissions for insert to authenticated
 with check(contributor_id=(select auth.uid()) and confirms_rights=true and review_status='pending');
-- NO policy to publish directly. A secure admin workflow must verify rights.
