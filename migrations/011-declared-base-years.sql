-- 011-declared-base-years.sql
-- The baseline a company declares, per report, with the reason it moved.
--
-- Felix, 2026-08-27. Two things this makes possible that nothing else does:
--
--   1. A baseline that jumps forward is one of the strongest available signals that the series
--      either side is not comparable. Companies rarely rebaseline for no reason, and the reason
--      is usually a boundary change — the exact thing the basis work exists to catch.
--
--   2. It stops the company's own choice deciding how much of their history we hold. The
--      declared baseline is recorded as a fact about them; scraping goes back until the reports
--      run out, not until the baseline says stop.
--
-- One row per (company, report), so the same company declaring 2019 in one year and 2023 in the
-- next produces two rows and the change is visible rather than overwritten.

begin;

create table if not exists public.company_base_years (
  company_id       text not null references public.companies(company_id) on delete cascade,
  reporting_year   integer not null,          -- the report that declares it
  base_year        integer not null,          -- the baseline that report states
  base_year_reason text,                      -- what the company says about setting or moving it
  restated         boolean not null default false,  -- did this report restate the baseline figure
  source_url       text,
  source_notes     text,
  created_at       timestamptz not null default now(),
  primary key (company_id, reporting_year)
);

comment on table public.company_base_years is
  'The baseline each report declares, and why. A moved baseline is a signal to review, not a fact to overwrite.';

-- What the newest report says, where it has actually been read. H&M only for now: the 2024
-- Annual and Sustainability Report states a 2019 baseline of 21,564 tCO2e scope 1 and says the
-- baseline was adjusted for refrigerants data. Nothing else here has been read at source, and
-- guessing would defeat the point of the table.
insert into public.company_base_years
  (company_id, reporting_year, base_year, base_year_reason, restated, source_url, source_notes)
values (
  'FASH_HM', 2024, 2019,
  'Baseline adjusted in the 2024 report: "For the baseline year, we have adjusted refrigerants data due to incorrect square meter data used for stores in 2019, resulting in a decrease of 2 percent or 1,458 tonnes CO2e in scope 1 and 2 for that year compared to what was reported in 2023."',
  true,
  'https://hmgroup.com/wp-content/uploads/2025/03/HM-Group-Annual-and-sustainability-report-2024.pdf',
  'Read at source 2026-08-27. Emissions table gives 2024, 2023, 2022 and 2019 (Baseline) in one column set; total scope 1 for the baseline year is 21,564 tCO2e.'
)
on conflict (company_id, reporting_year) do nothing;

commit;
