-- 013-capture-gaps-allow-baseline.sql
-- A baseline year is meant to sit on its own.
--
-- After backfilling H&M's 2019 baseline, capture_gaps reported the 2024 report as missing two
-- years — because that report gives 2024, 2023, 2022 and a 2019 baseline, so 2020 and 2021 look
-- like holes. They are not: H&M never published them in that report, and a baseline is by design
-- a long way from the recent years beside it.
--
-- Left alone, the check would flag every well-formed report in the dataset, and a check that
-- always complains is one nobody reads. So the contiguity test now runs over the recent block
-- only, ignoring any year the company declares as its baseline.

begin;

create or replace view public.capture_gaps as
with declared as (
  select company_id, base_year from public.company_base_years
),
recent as (
  select s.company_id, s.reporting_year, s.year
  from public.scope12 s
  where s.scope1_ghg is not null
    and not exists (
      select 1 from declared d
      where d.company_id = s.company_id and d.base_year = s.year
    )
),
cov as (
  select company_id, reporting_year,
         min(year) as first_year,
         max(year) as last_year,
         count(distinct year) as years_captured,
         array_agg(distinct year order by year) as years
  from recent
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
  'Reports that skip a year inside the recent block they cover. Declared baseline years are excluded, since a baseline is meant to stand apart. Either the company skipped the year or we failed to capture it — both need a person to look.';

commit;
