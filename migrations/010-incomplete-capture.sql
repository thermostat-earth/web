-- 010-incomplete-capture.sql
-- Catch the gap that caused the 2026-08-27 mistake, before it causes another.
--
-- H&M's 2024 report gives 2024, 2023, 2022 and a 2019 baseline in one table, and says in words
-- that it restated 2023. We captured 2022 and 2024 from it and nothing else. That hole made it
-- look as though H&M had left 2023 on an old boundary, and a judgement was nearly made on it.
--
-- A report that gives a figure for 2022 and 2024 but not 2023 is always worth a second look:
-- either the company really skipped it, which matters, or we failed to capture it, which is
-- worse because it is invisible. This names both cases instead of neither.

begin;

create or replace view public.capture_gaps as
with cov as (
  select company_id, reporting_year,
         min(year) as first_year,
         max(year) as last_year,
         count(distinct year) as years_captured,
         array_agg(distinct year order by year) as years
  from public.scope12
  where scope1_ghg is not null
  group by company_id, reporting_year
)
select
  c.company_id,
  co.company_name,
  c.reporting_year,
  c.first_year,
  c.last_year,
  c.years,
  (c.last_year - c.first_year + 1) - c.years_captured as years_missing
from cov c
join public.companies co on co.company_id = c.company_id
where (c.last_year - c.first_year + 1) > c.years_captured;

comment on view public.capture_gaps is
  'Reports that skip a year inside the range they cover. Either the company skipped it or we failed to capture it — both need a person to look, and an empty result is the only acceptable steady state.';

commit;
