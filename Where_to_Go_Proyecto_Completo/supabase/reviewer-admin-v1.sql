-- Where to Go: staff-only review, no browser-side service-role key.
-- Approval is NOT payment verification and does NOT publish a listing.
create table if not exists public.wtg_reviewers (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('owner','moderator')),
 created_at timestamptz not null default now()
);
alter table public.wtg_reviewers enable row level security;
revoke all on table public.wtg_reviewers from public,anon,authenticated;
grant select on table public.wtg_reviewers to authenticated;
create policy "Reviewer reads own role" on public.wtg_reviewers
 for select to authenticated using (user_id=(select auth.uid()));

-- Bootstrap only if exactly ONE registered user owns this pilot project and
-- that user already has a Google identity. Never promote arbitrary new users.
insert into public.wtg_reviewers(user_id,role)
select u.id,'owner' from auth.users u
where (select count(*) from auth.users)=1
and exists(select 1 from auth.identities i where i.user_id=u.id and i.provider='google')
on conflict (user_id) do nothing;

create table if not exists public.wtg_review_audit (
 id bigint generated always as identity primary key,
 submission_type text not null check (submission_type in ('business_submissions','tour_submissions','place_reports')),
 submission_id uuid not null,
 previous_status text,
 next_status text not null,
 reviewer_id uuid references auth.users(id) on delete set null,
 changed_at timestamptz not null default now()
);
alter table public.wtg_review_audit enable row level security;
revoke all on table public.wtg_review_audit from public,anon,authenticated;
grant select on table public.wtg_review_audit to authenticated;
create policy "Reviewers read audit only" on public.wtg_review_audit
 for select to authenticated using (
   exists(select 1 from public.wtg_reviewers r where r.user_id=(select auth.uid()))
 );

-- Staff may review/read submissions, but clients retain immutable owner,
-- plan, files and supplied business details.
grant update(status,reviewed_at) on public.business_submissions to authenticated;
grant update(status,reviewed_at) on public.tour_submissions to authenticated;
grant update(status) on public.place_reports to authenticated;
create policy "Staff reviews business requests" on public.business_submissions
 for select to authenticated using (
  exists(select 1 from public.wtg_reviewers r where r.user_id=(select auth.uid()))
 );
create policy "Staff updates only business review state" on public.business_submissions
 for update to authenticated
 using (exists(select 1 from public.wtg_reviewers r where r.user_id=(select auth.uid())))
 with check (exists(select 1 from public.wtg_reviewers r where r.user_id=(select auth.uid())))
 ;
create policy "Staff reviews tour requests" on public.tour_submissions
 for select to authenticated using (
  exists(select 1 from public.wtg_reviewers r where r.user_id=(select auth.uid()))
 );
create policy "Staff updates only tour review state" on public.tour_submissions
 for update to authenticated
 using (exists(select 1 from public.wtg_reviewers r where r.user_id=(select auth.uid())))
 with check (exists(select 1 from public.wtg_reviewers r where r.user_id=(select auth.uid())))
 ;
create policy "Staff reviews place reports" on public.place_reports
 for select to authenticated using (
  exists(select 1 from public.wtg_reviewers r where r.user_id=(select auth.uid()))
 );
create policy "Staff updates place report review state" on public.place_reports
 for update to authenticated
 using (exists(select 1 from public.wtg_reviewers r where r.user_id=(select auth.uid())))
 with check (exists(select 1 from public.wtg_reviewers r where r.user_id=(select auth.uid())))
 ;
create policy "Staff views deletion requests" on public.account_deletion_requests
 for select to authenticated using (
  exists(select 1 from public.wtg_reviewers r where r.user_id=(select auth.uid()))
 );

-- Applicant images stay private. Staff only receives READ access; no write.
create policy "Reviewers can read private application photos" on storage.objects
 for select to authenticated using (
   bucket_id in ('wtg-business-applications','wtg-tour-applications','wtg-place-reports')
   and exists(select 1 from public.wtg_reviewers r where r.user_id=(select auth.uid()))
 );

-- Immutable, server-side review audit; browser cannot insert/erase entries.
create schema if not exists private;
revoke all on schema private from public,anon,authenticated;
create or replace function private.wtg_review_audit_trigger()
returns trigger language plpgsql security definer
set search_path='' as $$
begin
 if new.status is distinct from old.status then
  insert into public.wtg_review_audit(submission_type,submission_id,previous_status,next_status,reviewer_id)
  values(tg_table_name,new.id,old.status,new.status,(select auth.uid()));
 end if;
 return new;
end;
$$;
revoke all on function private.wtg_review_audit_trigger() from public,anon,authenticated;
create trigger wtg_business_review_audit after update of status on public.business_submissions
 for each row execute function private.wtg_review_audit_trigger();
create trigger wtg_tour_review_audit after update of status on public.tour_submissions
 for each row execute function private.wtg_review_audit_trigger();
create trigger wtg_report_review_audit after update of status on public.place_reports
 for each row execute function private.wtg_review_audit_trigger();
