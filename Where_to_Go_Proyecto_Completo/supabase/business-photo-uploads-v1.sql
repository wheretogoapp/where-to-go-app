-- Where to Go: business uploads are private until an authorized moderator approves.
-- Apply after commercial-submissions-v1.sql.
alter table public.business_submissions
 add column if not exists photo_paths text[] not null default '{}';
alter table public.business_submissions
 drop constraint if exists business_submission_photos_valid;
alter table public.business_submissions
 add constraint business_submission_photos_valid check (
   coalesce(array_length(photo_paths,1),0) between 1 and 5
   and array_position(photo_paths, null) is null
 );

-- Owner-prefix restriction must be a WITH CHECK policy, not only a UI validation.
drop policy if exists "Business owners submit requests" on public.business_submissions;
create policy "Business owners submit requests" on public.business_submissions
 for insert to authenticated with check (
  user_id=(select auth.uid()) and status='pending' and reviewed_at is null
  and coalesce(array_length(photo_paths,1),0) between 1 and 5
  and (select coalesce(bool_and(p.path like ((select auth.uid())::text || '/%')),false)
       from unnest(photo_paths) as p(path))
 );
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('wtg-business-applications','wtg-business-applications',false,5242880,
        array['image/jpeg','image/png','image/webp'])
 on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,
 allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Business applicants upload own photos" on storage.objects;
create policy "Business applicants upload own photos" on storage.objects
 for insert to authenticated with check (
  bucket_id='wtg-business-applications' and
  (storage.foldername(name))[1]=(select auth.uid())::text
 );
drop policy if exists "Business applicants read own photos" on storage.objects;
create policy "Business applicants read own photos" on storage.objects
 for select to authenticated using (
  bucket_id='wtg-business-applications' and
  (storage.foldername(name))[1]=(select auth.uid())::text
 );
drop policy if exists "Business applicants remove own photos" on storage.objects;
create policy "Business applicants remove own photos" on storage.objects
 for delete to authenticated using (
  bucket_id='wtg-business-applications' and
  (storage.foldername(name))[1]=(select auth.uid())::text
 );
revoke all privileges on public.business_submissions from public,anon,authenticated;
grant select,insert on public.business_submissions to authenticated;
