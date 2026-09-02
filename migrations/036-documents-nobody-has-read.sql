-- 036: a report nobody has taken a single figure from is the most part-read report there is.
--
-- Found 2026-09-02, while looking for something else. The coverage check from 034 compares what we
-- took from one publication against what we took from the same company's fullest — which means a
-- document we have read NOTHING from is invisible to it. There is no row to count.
--
-- Three of the fifteen documents we hold are in that state, and two of them are the company's most
-- recent report:
--   Chanel Sustainability Extract 2025
--   H&M Group Annual and Sustainability Report 2025
--   ITV Social Purpose Report 2021
--
-- That is the worst possible one to have missed. Step 4 of the restatement methodology works
-- backwards from the most recent publication, because the newest is the company's current position.
-- If the newest report is unread, every judgement below it is being made against a stale reference
-- and nothing says so.
--
-- The escape hatch is deliberate. A document can legitimately contain no emissions figures — a
-- transition plan that is all targets, a methodology note. Recording that is a fact somebody
-- establishes by reading it, so it is written down as one: `read_no_figures_at`. Without a hatch
-- this check would block a company forever on a document that never had anything to take.

begin;

alter table public.documents add column if not exists read_no_figures_at timestamptz;
alter table public.documents add column if not exists read_no_figures_note text;

comment on column public.documents.read_no_figures_at is
  'Set when somebody has read this document and established it contains no emissions figures to capture. Not a way to skip a report — a record that it was read and had nothing in it.';

create or replace view public.unread_documents as
select d.id, d.company_id, c.company_name, d.title, d.url, d.published_on,
       'no figure anywhere in the database cites this document' as problem
from public.documents d
  join public.companies c on c.company_id = d.company_id
where d.read_no_figures_at is null
  and not exists (select 1 from public.scope3  s where s.document_id = d.id)
  and not exists (select 1 from public.scope12 s where s.document_id = d.id);

comment on view public.unread_documents is
  'Reports we hold and have taken nothing from. Invisible to publication_coverage_gaps, which can only compare publications that produced rows.';

grant select on public.unread_documents to anon, authenticated;

create or replace view public.evidence_health as
select c.company_id, c.company_name,
       (select count(*) from public.documents d where d.company_id = c.company_id) as documents,
       (select count(*) from public.documents d where d.company_id = c.company_id and d.last_status <> 200) as documents_unreachable,
       (select count(*) from public.documents d where d.company_id = c.company_id and d.published_on is null) as documents_undated,
       (select count(*) from public.unverified_figures u where u.company_id = c.company_id) as figures_unverified,
       (select count(*) from public.restatements_for_review r where r.company_id = c.company_id) as restatements,
       (select count(*) from public.restatements_for_review r where r.company_id = c.company_id
          and coalesce(r.company_stated_reason,'') = '') as restatements_unexplained,
       (select count(*) from public.capture_gaps g where g.company_id = c.company_id) as reports_with_gaps,
       (select count(*) from public.publication_coverage_gaps p where p.company_id = c.company_id) as publications_part_read,
       (select count(*) from public.unread_documents u where u.company_id = c.company_id) as documents_unread
from public.companies c;

commit;
