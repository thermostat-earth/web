-- 019-review-uses-deep-links.sql
-- Updated 2026-08-27: also passes through `documents` and `any_date_assumed`, added to
-- restatements_detected by migration 020. Re-running 019 after 020 had been silently restoring
-- the older column list, so the review page asked for a column that did not exist.
-- The review view hands out links that open at the page, not at the front of a 10MB PDF.
-- Identical to migration 009 except that both source URLs go through source_link().

begin;

drop view if exists public.restatements_for_review;
create view public.restatements_for_review as
select
  r.company_id,
  c.company_name,
  c.sector,
  r.year,
  r.measure,
  r.category,
  r.readings,
  r.documents,
  r.any_date_assumed,

  r.first_reported_in,
  r.first_ghg,
  r.last_reported_in,
  r.last_ghg,
  r.change,
  r.pct_change,

  -- What the company said about it, taken from the reading that introduced the new figure.
  case when r.measure = 'scope1'
    then (select s.restatement_reason from public.scope12 s
           where s.company_id = r.company_id and s.year = r.year
             and s.reporting_year = r.last_reported_in)
    else (select s.restatement_reason from public.scope3 s
           where s.company_id = r.company_id and s.year = r.year
             and s.category = r.category and s.reporting_year = r.last_reported_in)
  end as company_stated_reason,

  -- Where each reading came from, so the claim can be checked against the document.
  (select public.source_link(v.source_url, v.source_page) from public.company_year_review v
    where v.company_id = r.company_id and v.year = r.year
      and v.reporting_year = r.first_reported_in) as first_source_url,
  (select v.source_notes from public.company_year_review v
    where v.company_id = r.company_id and v.year = r.year
      and v.reporting_year = r.first_reported_in) as first_source_notes,
  (select public.source_link(v.source_url, v.source_page) from public.company_year_review v
    where v.company_id = r.company_id and v.year = r.year
      and v.reporting_year = r.last_reported_in) as last_source_url,
  (select v.source_notes from public.company_year_review v
    where v.company_id = r.company_id and v.year = r.year
      and v.reporting_year = r.last_reported_in) as last_source_notes

from public.restatements_detected r
join public.companies c on c.company_id = r.company_id;

comment on view public.restatements_for_review is
  'Every restatement with the evidence needed to judge it: both figures, what the company said, and the document each reading came from. Decides nothing.';

commit;
