-- 030-verification-harness.sql
-- The checks that make an extracted figure trustworthy rather than hopeful.
--
-- Every problem found by hand on 2026-08-27 was found by a person reading a PDF. Three of the
-- four would have been caught automatically by the checks below, and the scraper is about to
-- produce figures far faster than anyone can read documents.
--
--   unverified_figures  a figure whose source document was never confirmed to contain it
--   category_totals     extracted categories against the totals the document itself states
--   evidence_health     one row per company: what is verified, what is not, what is missing
--
-- None of these decide anything. They say what is not yet known to be true.

begin;

-- 1. Has a figure been verified against the document it cites?
alter table public.scope12 add column if not exists verified_at timestamptz;
alter table public.scope12 add column if not exists verified_note text;
alter table public.scope3  add column if not exists verified_at timestamptz;
alter table public.scope3  add column if not exists verified_note text;

create or replace view public.unverified_figures as
select 'scope1' as measure, s.company_id, s.year, s.reporting_year, null::int as category,
       s.scope1_ghg as ghg, d.title as document, d.url,
       case when s.document_id is null then 'no document cited'
            when s.verified_at is null then 'never checked against the document'
       end as problem
from public.scope12 s
left join public.documents d on d.id = s.document_id
where s.scope1_ghg is not null and (s.document_id is null or s.verified_at is null)
union all
select 'scope3', s.company_id, s.year, s.reporting_year, s.category,
       s.ghg, d.title, d.url,
       case when s.document_id is null then 'no document cited'
            when s.verified_at is null then 'never checked against the document'
       end
from public.scope3 s
left join public.documents d on d.id = s.document_id
where s.ghg is not null and (s.document_id is null or s.verified_at is null);

comment on view public.unverified_figures is
  'Figures nobody has confirmed appear in the document they cite. A figure with a source that does not contain it is worse than one with no source, because it looks checked.';

-- 2. Do the categories add up to what the company said the total was?
--    H&M 2019 reconciled to within 1,000 of a stated 9,115,000 — that is what a correct
--    extraction looks like, and a misread row would not land that close.
create or replace view public.category_totals as
select s.company_id, s.year, s.reporting_year,
       count(*) filter (where s.ghg is not null) as categories_with_figure,
       sum(s.ghg) filter (where s.category <> 11) as total_excluding_use_phase,
       sum(s.ghg) as total_including_use_phase,
       max(d.title) as document
from public.scope3 s
left join public.documents d on d.id = s.document_id
group by s.company_id, s.year, s.reporting_year;

comment on view public.category_totals is
  'What the captured categories add up to, so it can be compared against the total the document states. The comparison itself needs the stated total captured, which the extractor must do.';

-- 3. One row per company: is its evidence in a state worth trusting?
create or replace view public.evidence_health as
select c.company_id, c.company_name,
       (select count(*) from public.documents d where d.company_id = c.company_id) as documents,
       (select count(*) from public.documents d where d.company_id = c.company_id and d.last_status <> 200) as documents_unreachable,
       (select count(*) from public.documents d where d.company_id = c.company_id and d.published_on is null) as documents_undated,
       (select count(*) from public.unverified_figures u where u.company_id = c.company_id) as figures_unverified,
       (select count(*) from public.restatements_for_review r where r.company_id = c.company_id) as restatements,
       (select count(*) from public.restatements_for_review r where r.company_id = c.company_id
          and coalesce(r.company_stated_reason,'') = '') as restatements_unexplained,
       (select count(*) from public.capture_gaps g where g.company_id = c.company_id) as reports_with_gaps
from public.companies c;

comment on view public.evidence_health is
  'One row per company: how much of what we hold about it is actually evidenced. Zero everywhere is the only state worth calling ready.';

commit;
