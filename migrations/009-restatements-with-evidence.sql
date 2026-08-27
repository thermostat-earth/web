-- 009-restatements-with-evidence.sql
-- Put the evidence next to the candidate.
--
-- Felix, 2026-08-27: the judgement has to be made "alongside all the other stuff", and needs
-- "all info the company gives about any restatements, with sources, obviously".
--
-- All of it is already held, just in three places: the two readings in scope12/scope3, what the
-- company said in restatement_reason, and the document each reading came from in
-- company_year_review.source_url. Nobody should have to join those by hand to make a judgement.
--
-- Still decides nothing. H&M's reason says the boundary moved (Sellpy pulled into group scope 1
-- and 2); Microsoft's says the calculation changed (an LCA update applied to all prior years).
-- Those need opposite answers, and only a person reading them can tell.

begin;

create or replace view public.restatements_for_review as
select
  r.company_id,
  c.company_name,
  c.sector,
  r.year,
  r.measure,
  r.category,
  r.readings,

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
  (select v.source_url from public.company_year_review v
    where v.company_id = r.company_id and v.year = r.year
      and v.reporting_year = r.first_reported_in) as first_source_url,
  (select v.source_notes from public.company_year_review v
    where v.company_id = r.company_id and v.year = r.year
      and v.reporting_year = r.first_reported_in) as first_source_notes,
  (select v.source_url from public.company_year_review v
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
