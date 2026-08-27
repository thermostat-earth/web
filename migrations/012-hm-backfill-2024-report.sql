-- 012-hm-backfill-2024-report.sql
-- Capture the two years H&M's 2024 report states that we never took from it.
--
-- The H&M Group Annual and Sustainability Report 2024 gives 2024, 2023, 2022 and a 2019 baseline
-- in one table. We had taken 2022 and 2024 only, which made it look as though H&M had left 2023
-- on an older boundary. They had not — the report says in words that 2023 was updated and that
-- changes were applied to historical results.
--
-- Figures read at source 2026-08-27 from that report's emissions table:
--   scope 1       2023 = 15,754    2019 = 21,564
--   scope 2 loc   2023 = 377,573   2019 = 658,646
--   scope 2 mkt   2023 = 39,508    2019 = 48,735
--
-- Dry-run first inside a transaction and rolled back: the score does not move. It stays 1.5095
-- location and 1.5206 market on 2022-2024, because the restated 2023 matches what we already
-- held and 2019 cannot join a run with 2020 absent.

begin;

insert into public.scope12
  (company_id, year, reporting_year, scope1_ghg,
   scope2_location_disclosed, scope2_location_ghg,
   scope2_market_disclosed, scope2_market_ghg,
   restatement_reason, basis_id)
values
  ('FASH_HM', 2023, 2024, 15754, true, 377573, true, 39508,
   'As stated in the 2024 Annual and Sustainability Report. The report says scope 1 and 2 figures for 2023 were updated, replacing some estimates with actual data and including a distribution centre in Poland mainly used by Sellpy, an increase of 1 percent or 457 tonnes CO2e in scope 1 and 2 combined.', 1),
  ('FASH_HM', 2019, 2024, 21564, true, 658646, true, 48735,
   'Baseline year as stated in the 2024 Annual and Sustainability Report. Refrigerants data adjusted for incorrect square metre data used for stores in 2019, a decrease of 2 percent or 1,458 tonnes CO2e in scope 1 and 2 compared with what was reported in 2023.', 1)
on conflict do nothing;

-- reviewed_by is a person. These were read from the source document by the assistant and have
-- NOT been checked by Felix, so they say so rather than borrowing his name.
insert into public.company_year_review (company_id, year, reporting_year, reviewed_by, review_notes, source_url, source_notes)
values
  ('FASH_HM', 2023, 2024, 'Assistant — read at source, not yet reviewed',
   'Backfilled from the 2024 report because the original capture took only 2022 and 2024 from it. Needs a human spot-check against the PDF.',
   'https://hmgroup.com/wp-content/uploads/2025/03/HM-Group-Annual-and-sustainability-report-2024.pdf',
   'Read at source 2026-08-27 from the emissions table.'),
  ('FASH_HM', 2019, 2024, 'Assistant — read at source, not yet reviewed',
   'Baseline year, never captured before. Needs a human spot-check against the PDF.',
   'https://hmgroup.com/wp-content/uploads/2025/03/HM-Group-Annual-and-sustainability-report-2024.pdf',
   'Baseline year column of the emissions table. Read at source 2026-08-27.')
on conflict do nothing;

select public.score_company('FASH_HM');

commit;
