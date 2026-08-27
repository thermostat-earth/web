-- 020-detect-by-document.sql
-- A restatement is two documents disagreeing, so order the readings by when the document was
-- published rather than by reporting_year.
--
-- reporting_year was standing in for "which report", and it is not one: H&M's 2021, 2022 and
-- 2023 readings all came from a single climate transition plan. Now that every reading points at
-- a document, the ordering can use the thing it always meant.
--
-- published_on is missing for five documents, so the sort falls back to reporting_year rather
-- than dropping those readings. Ordering by a null would silently reshuffle real data.

begin;

drop view if exists public.restatements_for_review;
drop view if exists public.restatements_detected;
create view public.restatements_detected as
with readings as (
  select s.company_id, s.year, 'scope1'::text as measure, null::int as category,
         s.reporting_year, s.scope1_ghg as ghg, s.document_id,
         coalesce(d.published_on, make_date(s.reporting_year, 12, 31)) as published_on,
         d.published_on is null as date_is_assumed
  from public.scope12 s
  left join public.documents d on d.id = s.document_id
  where s.scope1_ghg is not null
  union all
  select s.company_id, s.year, 'scope3'::text, s.category,
         s.reporting_year, s.ghg, s.document_id,
         coalesce(d.published_on, make_date(s.reporting_year, 12, 31)),
         d.published_on is null
  from public.scope3 s
  left join public.documents d on d.id = s.document_id
  where s.ghg is not null
),
ranked as (
  select company_id, year, measure, category, reporting_year, ghg, document_id, published_on,
         first_value(ghg)           over w as first_ghg,
         last_value(ghg)            over w as last_ghg,
         first_value(reporting_year) over w as first_reported_in,
         last_value(reporting_year)  over w as last_reported_in,
         first_value(document_id)    over w as first_document_id,
         last_value(document_id)     over w as last_document_id,
         bool_or(date_is_assumed)    over (partition by company_id, year, measure, category) as any_date_assumed,
         -- count(distinct ...) over () is not supported; documents are counted in a join below

         count(*) over (partition by company_id, year, measure, category) as readings
  from readings
  window w as (
    partition by company_id, year, measure, category
    order by published_on, reporting_year
    rows between unbounded preceding and unbounded following
  )
)
select distinct
  r.company_id, r.year, r.measure, r.category, r.readings,
  dc.documents,
  r.first_reported_in, first_ghg, first_document_id,
  r.last_reported_in,  last_ghg,  last_document_id,
  r.last_ghg - first_ghg as change,
  round(100.0 * (r.last_ghg - r.first_ghg) / nullif(r.first_ghg, 0), 1) as pct_change,
  r.any_date_assumed
from ranked r
join (
  select company_id, year, measure, category, count(distinct document_id) as documents
  from readings
  group by company_id, year, measure, category
) dc on  dc.company_id = r.company_id
     and dc.year       = r.year
     and dc.measure    = r.measure
     -- category is NULL for scope 1, and USING/= would treat that as not-equal, silently
     -- dropping every scope 1 candidate. Found 2026-08-27 by comparing counts before and after.
     and dc.category is not distinct from r.category
where r.readings > 1
  and r.first_ghg is distinct from r.last_ghg;

comment on view public.restatements_detected is
  'Years reported more than once with a different figure, ordered by when each document was published. any_date_assumed flags candidates where a publication date was missing and reporting_year stood in for it.';

commit;
