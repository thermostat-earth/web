-- 034: you may not call a restatement unexplained until you have read everything.
--
-- Felix, 2026-09-02: "need to make sure every possible literature has been read before claiming the
-- explanation is not published." Step 3 scenario one turns on whether a change was applied to every
-- year, and step 2 turns on whether the company explained itself. Both claims are about the whole
-- document set. Neither is safe to make from a partial reading.
--
-- The case that forced it. Microsoft's 2025 report says its LCA update was applied to all prior
-- years. We hold 2 categories from that publication where every other Microsoft publication gave
-- 15 — category 2 across 2020-2023, category 1 for 2022 alone. Read naively, Microsoft's category 1
-- looks like a change applied to one year out of four, which under the scenario-one rule rejects
-- the whole window. The fault would be ours.
--
-- capture_gaps does not catch this: it looks for missing *years* within a publication's span, in
-- scope 1 and 2. This looks for missing *categories* in scope 3.
--
-- Deliberately phrased as "not known to be complete" rather than "incomplete". A publication that
-- genuinely restated two lines is indistinguishable from one we only read two lines of — and that
-- is exactly the point. It is not an accusation, it is an unread document.

begin;

create or replace view public.publication_coverage_gaps as
with per_pub as (
  select company_id, reporting_year,
         count(distinct category) as categories_captured,
         count(distinct year)     as years_covered
  from public.scope3
  -- Every category the publication was read *for*, whether or not it carried a figure. A row with
  -- no figure and a not_reported_reason is a category somebody read and recorded as absent, which
  -- is the opposite of an unread one. Filtering on `ghg is not null` here flagged five publications
  -- instead of one, because it counted a company's honest non-disclosure as our failure to read.
  group by company_id, reporting_year
), best as (
  select company_id, max(categories_captured) as fullest_publication
  from per_pub group by company_id
)
select p.company_id, c.company_name, p.reporting_year,
       p.categories_captured, b.fullest_publication, p.years_covered,
       'this publication gave us ' || p.categories_captured || ' scope 3 categories where the same company''s fullest gave ' || b.fullest_publication || ' — read it before calling anything unexplained' as problem
from per_pub p
  join best b on b.company_id = p.company_id
  join public.companies c on c.company_id = p.company_id
where p.categories_captured < b.fullest_publication;

comment on view public.publication_coverage_gaps is
  'Publications we have read less of than we have read of the same company elsewhere. Not an accusation against the company: a warning that a claim about what it did or did not say would be made from a partial reading.';

grant select on public.publication_coverage_gaps to anon, authenticated;

-- Carried into the per-company health row, so the review page can block on it rather than a person
-- having to remember to look.
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
       (select count(*) from public.publication_coverage_gaps p where p.company_id = c.company_id) as publications_part_read
from public.companies c;

commit;
