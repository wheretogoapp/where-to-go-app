-- Staff-only review notes for applicants; status alone is not enough feedback.
-- Notes are never publicly searchable and cannot be modified by applicants.
alter table public.business_submissions
 add column if not exists review_note text not null default '' check (char_length(review_note)<=1000);
alter table public.tour_submissions
 add column if not exists review_note text not null default '' check (char_length(review_note)<=1000);
alter table public.place_reports
 add column if not exists review_note text not null default '' check (char_length(review_note)<=1000);
alter table public.place_reports add column if not exists reviewed_at timestamptz;
grant update(review_note) on public.business_submissions to authenticated;
grant update(review_note) on public.tour_submissions to authenticated;
grant update(review_note,reviewed_at) on public.place_reports to authenticated;
