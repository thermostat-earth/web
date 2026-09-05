-- 053 — a year nobody printed is not a year we failed to read
--
-- Felix, 2026-09-05: "can we fix the problem you said earlier about difference between no reading
-- and not published?"
--
-- capture_gaps asked its question of ONE PUBLICATION AT A TIME: does this report's span of years
-- have holes in it? Netflix's 2025 report prints 2019 and then 2022-2025, so it reported a gap of
-- two years and held Netflix off the review desk. Netflix's 2020 and 2021 figures are in its 2024
-- report and have been in this database since read-figures started reading every publication. The
-- company's coverage is complete; only the newest report's own span had holes, and those holes are
-- Netflix's editorial choice about which columns to print.
--
-- So the question is asked of the COMPANY now: is this year missing from every report we hold?
--
-- And where one still is, the two cases are named, because they need opposite work and were
-- indistinguishable — which is what got Netflix and Amazon written off as failures this week:
--
--   years_no_report_prints  — we hold a report whose span covers the year and it does not print it.
--                             That is a fact about the company, not about our reading. It belongs on
--                             the page as a completeness flag and must NOT hold up a review.
--
--   years_no_report_covers  — no report we hold reaches that year at all. That is our gap, and the
--                             remedy is to go and find the report. This one does hold up a review.
--
-- Only the second kind produces a row here, because evidence_health counts these rows and
-- review-ready turns that count into a blocker. The first kind is carried on the row as information
-- for whoever reads it.
--
-- ⚠️ WHAT THIS STILL CANNOT TELL YOU, and it should not pretend otherwise: whether a company
-- published a year in a report we have never fetched. "No report we hold covers 2020" is honest;
-- "the company never published 2020" is a claim about documents, and the document list lives in the
-- ops database, not here. The queue worker already asks plan-documents to go looking before it parks
-- a company, which is the right place for that question.
--
-- Checked against live data before applying. Netflix: 2019-2025 complete across two publications, no
-- row. Inditex: one publication spanning 2018-2025 that prints only 2018, 2024 and 2025 — no row,
-- and 2019-2023 recorded as years its report does not print. H&M: 2020 missing.

begin;


create or replace view public.capture_gaps as
with held as (
  select company_id, reporting_year, year
  from public.scope12
  where scope1_ghg is not null
),
company_span as (
  select company_id,
         min(year) as first_year,
         max(year) as last_year,
         count(distinct year) as years_captured,
         array_agg(distinct year order by year) as years
  from held
  group by company_id
),
-- What each publication we hold reaches, so a missing year can be told from a year no report goes
-- near. A publication's span is the earliest and latest year it prints, not the years in between.
publication_span as (
  select company_id, reporting_year, min(year) as first_year, max(year) as last_year
  from held
  group by company_id, reporting_year
),
missing as (
  select cs.company_id, g.yr,
         exists (
           select 1 from publication_span p
            where p.company_id = cs.company_id
              and g.yr between p.first_year and p.last_year
         ) as a_report_covers_it
  from company_span cs
  cross join lateral generate_series(cs.first_year, cs.last_year) as g(yr)
  where not exists (
    select 1 from held h where h.company_id = cs.company_id and h.year = g.yr
  )
)
select
  cs.company_id,
  co.company_name,
  (select max(h.reporting_year) from held h where h.company_id = cs.company_id) as reporting_year,
  cs.first_year,
  cs.last_year,
  cs.years,
  (select count(*) from missing m
    where m.company_id = cs.company_id and not m.a_report_covers_it) as years_missing,
  (select array_agg(m.yr order by m.yr) from missing m
    where m.company_id = cs.company_id and not m.a_report_covers_it) as years_no_report_covers,
  (select array_agg(m.yr order by m.yr) from missing m
    where m.company_id = cs.company_id and m.a_report_covers_it) as years_no_report_prints
from company_span cs
join public.companies co on co.company_id = cs.company_id
where exists (
  select 1 from missing m where m.company_id = cs.company_id and not m.a_report_covers_it
);

comment on view public.capture_gaps is
  'One row per company that is missing a year NO report we hold reaches — our gap, and a genuine '
  'blocker on opening a review. Years that a report we hold spans but does not print are the '
  'company''s own choice and are carried in years_no_report_prints WITHOUT producing a row, because '
  'evidence_health counts these rows and review-ready turns that count into a blocker.';

commit;
