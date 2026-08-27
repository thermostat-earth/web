-- 024-read-access-for-review.sql
-- The ops app reads ThermoStat with the publishable (anon) key, read-only. The new review
-- objects need the same grant the existing ones have, or the review page gets an empty grid and
-- no error — the silent kind of failure this stack keeps being bitten by.
--
-- Nothing here is sensitive: it is companies' own published figures and the documents they came
-- from. Writes still go the other way, through the VPS with the service key.

begin;

grant select on public.documents             to anon, authenticated;
grant select on public.company_base_years    to anon, authenticated;
grant select on public.restatements_detected to anon, authenticated;
grant select on public.restatements_for_review to anon, authenticated;
grant select on public.capture_gaps          to anon, authenticated;

alter table public.documents          enable row level security;
alter table public.company_base_years enable row level security;

drop policy if exists documents_public_read on public.documents;
create policy documents_public_read on public.documents for select to anon, authenticated using (true);

drop policy if exists company_base_years_public_read on public.company_base_years;
create policy company_base_years_public_read on public.company_base_years for select to anon, authenticated using (true);

commit;
