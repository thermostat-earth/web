-- 008-detect-restatements.sql
-- Step 2 of REPORTING-BASIS-PLAN.md, first half: the numeric signal.
--
-- A year reported more than once with a different figure is a restatement. That is a FACT the
-- database can compute. Whether it is a *basis change* is a judgement, and this view does not
-- make it — ITV's FY2022 category 11 moved 91% because the calculation improved, not because the
-- boundary moved, so anything that decided on the number alone would be wrong about ITV.
--
-- So: this lists candidates, biggest movement first, and says nothing about what they mean.
--
-- No percentage threshold, deliberately. Across the four companies held today there are three
-- scope 1 restatements and twelve in scope 3 — few enough to look at every one. A threshold
-- would be a number nobody chose on evidence, and it would hide small movements that matter.

begin;

create or replace view public.restatements_detected as
with s12 as (
  select company_id, year, 'scope1'::text as measure, null::int as category,
         reporting_year, scope1_ghg as ghg
  from public.scope12
  where scope1_ghg is not null
),
s3 as (
  select company_id, year, 'scope3'::text as measure, category,
         reporting_year, ghg
  from public.scope3
  where ghg is not null
),
all_readings as (
  select * from s12
  union all
  select * from s3
),
ranked as (
  select company_id, year, measure, category, reporting_year, ghg,
         first_value(ghg)            over w as first_ghg,
         last_value(ghg)             over w as last_ghg,
         first_value(reporting_year) over w as first_reported_in,
         last_value(reporting_year)  over w as last_reported_in,
         count(*) over (partition by company_id, year, measure, category) as readings
  from all_readings
  window w as (
    partition by company_id, year, measure, category
    order by reporting_year
    rows between unbounded preceding and unbounded following
  )
)
select distinct
  company_id,
  year,
  measure,
  category,
  readings,
  first_reported_in,
  first_ghg,
  last_reported_in,
  last_ghg,
  last_ghg - first_ghg as change,
  round(100.0 * (last_ghg - first_ghg) / nullif(first_ghg, 0), 1) as pct_change
from ranked
where readings > 1
  and first_ghg is distinct from last_ghg;

comment on view public.restatements_detected is
  'Years reported more than once with a different figure. A candidate for a basis break, not a decision — detection must never decide on its own (see REPORTING-BASIS-PLAN.md step 2).';

commit;
