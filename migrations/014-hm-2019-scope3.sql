-- 014-hm-2019-scope3.sql
-- H&M's 2019 baseline scope 3, from the 2024 report's category table.
--
-- We already hold the 2019 scope 1 and 2 baseline; without scope 3 the baseline year was half
-- captured. Every figure below is read from the H&M Group Annual and Sustainability Report 2024,
-- 2019 (Baseline) column, and follows the conventions the existing rows use.
--
-- Category 1 is the sum of the components the report lists separately, exactly as the 2022 and
-- 2023 rows were built:
--   raw materials 1,849,000 + fabric production 4,826,000 + garment manufacturing 360,000
--   + non-garment goods 454,000 + packaging 235,000 + other expenditures 706,000 = 8,430,000
--
-- Extraction checked against the report's own totals rather than trusted:
--   sum excluding use-phase = 9,116,000 against the stated 9,115,000
--   sum including use-phase  = 11,615,000 against the stated 11,613,000
-- Both within the rounding the report declares (nearest thousand).
--
-- Category 2, 8, 10 and 13 are absent because H&M states it: "For categories 2 capital goods,
-- 8 & 13 leased assets, and 10 processing of sold products, no activities with relevant climate
-- impact has been identified, therefore these are excluded from disclosure."

begin;

insert into public.scope3
  (company_id, year, reporting_year, category, reported, ghg, notes, not_reported_reason)
values
  ('FASH_HM', 2019, 2024,  1, true,  8430000, 'Sum of raw materials, fabric production, garment manufacturing, non-garment goods, packaging and other expenditures. Rounded to nearest 1000 tCO2e. Source: H&M 2024 Annual and Sustainability Report scope 3 table, 2019 baseline column.', null),
  ('FASH_HM', 2019, 2024,  2, false, null,    'H&M states no relevant climate impact identified. Excluded from disclosure.', 'excluded_no_activity'),
  ('FASH_HM', 2019, 2024,  3, true,    33000, 'Fuel and energy related emissions. Rounded to nearest 1000 tCO2e. Source: H&M 2024 Annual and Sustainability Report scope 3 table, 2019 baseline column.', null),
  ('FASH_HM', 2019, 2024,  4, true,   453000, 'Transport. Rounded to nearest 1000 tCO2e. Source: H&M 2024 Annual and Sustainability Report scope 3 table, 2019 baseline column.', null),
  ('FASH_HM', 2019, 2024,  5, true,     4000, 'Waste in own operations. Rounded to nearest 1000 tCO2e. Source: H&M 2024 Annual and Sustainability Report scope 3 table, 2019 baseline column.', null),
  ('FASH_HM', 2019, 2024,  6, true,    23000, 'Business travel. Rounded to nearest 1000 tCO2e. Source: H&M 2024 Annual and Sustainability Report scope 3 table, 2019 baseline column.', null),
  ('FASH_HM', 2019, 2024,  7, true,    44000, 'Employee commuting. Rounded to nearest 1000 tCO2e. Source: H&M 2024 Annual and Sustainability Report scope 3 table, 2019 baseline column.', null),
  ('FASH_HM', 2019, 2024,  8, false, null,    'H&M states no relevant climate impact identified. Excluded from disclosure.', 'excluded_no_activity'),
  ('FASH_HM', 2019, 2024,  9, false, null,    'Not reported by H&M.', 'not_disclosed'),
  ('FASH_HM', 2019, 2024, 10, false, null,    'H&M states no relevant climate impact identified. Excluded from disclosure.', 'excluded_no_activity'),
  ('FASH_HM', 2019, 2024, 11, true,  2499000, 'Use of sold products. Outside H&M''s science based target. Rounded to nearest 1000 tCO2e. Source: H&M 2024 Annual and Sustainability Report scope 3 table, 2019 baseline column.', null),
  ('FASH_HM', 2019, 2024, 12, true,    73000, 'End-of-life sold products. Rounded to nearest 1000 tCO2e. Source: H&M 2024 Annual and Sustainability Report scope 3 table, 2019 baseline column.', null),
  ('FASH_HM', 2019, 2024, 13, false, null,    'H&M states no relevant climate impact identified. Excluded from disclosure.', 'excluded_no_activity'),
  ('FASH_HM', 2019, 2024, 14, true,    50000, 'Franchise. Rounded to nearest 1000 tCO2e. Source: H&M 2024 Annual and Sustainability Report scope 3 table, 2019 baseline column.', null),
  ('FASH_HM', 2019, 2024, 15, true,     6000, 'Investments. Sellpy scope 1 and 2 sit in the group boundary from the 2024 report, not here. Rounded to nearest 1000 tCO2e. Source: H&M 2024 Annual and Sustainability Report scope 3 table, 2019 baseline column.', null)
on conflict do nothing;

select public.score_company('FASH_HM');

commit;
