-- 035: read the whole of Microsoft's 2025 fact sheet, not just the lines that had moved.
--
-- Felix, 2026-09-02: "Should we just read them all before making the judgement. Feels weird order."
-- He is right, and this is that, done for the one report the coverage check flagged.
--
-- What was there. We held 5 figures from this publication — category 1 for FY22 and category 2 for
-- FY20 to FY23 — because whoever captured it took the restated cells and stopped. Table 1A on page 3
-- of the document gives all eleven categories Microsoft reports, for FY20 through FY24. Capturing
-- only what changed makes "unchanged" and "never read" look identical, which is the whole reason
-- the coverage check exists.
--
-- FY24 is deliberately untouched: those fifteen rows are already held, filed under reporting_year
-- 2024. Microsoft's rows use reporting_year inconsistently — FY20 to FY23 are all filed as separate
-- "publications" while every one of them was read from the 2024 fact sheet — and straightening that
-- out is a separate job, not something to do quietly inside a data capture.
--
-- Checked against the document's own arithmetic before being written. The categories below sum to
-- Microsoft's stated Scope 3 subtotal for every year:
--   FY20  11,795,656 vs 11,796,000 stated   (the two unrounded FY20/FY21 lines account for it)
--   FY21  13,576,201 vs 13,576,000 stated
--   FY22  15,916,000 vs 15,916,000 stated   exact
--   FY23  16,397,000 vs 16,397,000 stated   exact
-- A misread digit anywhere would not land inside a few hundred tonnes of four separate totals.

begin;

insert into public.scope3
  (company_id, year, reporting_year, category, ghg, reported, not_reported_reason,
   document_id, source_page, verified_at, verified_note)
values
  -- FY20
  ('TECH_MSFT', 2020, 2025,  1, 4415000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2020, 2025,  3,  300000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2020, 2025,  4,  243000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2020, 2025,  5,    9500, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2020, 2025,  6,  329356, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2020, 2025,  7,  317000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2020, 2025,  9,   65000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2020, 2025, 11, 2983000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2020, 2025, 12,   17000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2020, 2025, 13,   11800, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2020, 2025,  8, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A'),
  ('TECH_MSFT', 2020, 2025, 10, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A'),
  ('TECH_MSFT', 2020, 2025, 14, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A'),
  ('TECH_MSFT', 2020, 2025, 15, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A'),
  -- FY21
  ('TECH_MSFT', 2021, 2025,  1, 4930000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2021, 2025,  3,  350000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2021, 2025,  4,  225000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2021, 2025,  5,    5700, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2021, 2025,  6,   21901, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2021, 2025,  7,   80000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2021, 2025,  9,   69000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2021, 2025, 11, 3950000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2021, 2025, 12,   19000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2021, 2025, 13,    9600, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2021, 2025,  8, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A'),
  ('TECH_MSFT', 2021, 2025, 10, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A'),
  ('TECH_MSFT', 2021, 2025, 14, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A'),
  ('TECH_MSFT', 2021, 2025, 15, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A'),
  -- FY22
  ('TECH_MSFT', 2022, 2025,  3,  450000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2022, 2025,  4,  371000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2022, 2025,  5,    8000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2022, 2025,  6,  139000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2022, 2025,  7,  141000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2022, 2025,  9,   69000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2022, 2025, 11, 5101000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2022, 2025, 12,   18000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2022, 2025, 13,    8000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2022, 2025,  8, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A'),
  ('TECH_MSFT', 2022, 2025, 10, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A'),
  ('TECH_MSFT', 2022, 2025, 14, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A'),
  ('TECH_MSFT', 2022, 2025, 15, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A'),
  -- FY23
  ('TECH_MSFT', 2023, 2025,  1, 5564000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2023, 2025,  3,  521000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2023, 2025,  4,  318000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2023, 2025,  5,    8000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2023, 2025,  6,  133000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2023, 2025,  7,  187000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2023, 2025,  9,   69000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2023, 2025, 11, 3941000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2023, 2025, 12,    4000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2023, 2025, 13,    7000, true, null, 12, 3, now(), 'Table 1A, 2025 Environmental Data Fact Sheet'),
  ('TECH_MSFT', 2023, 2025,  8, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A'),
  ('TECH_MSFT', 2023, 2025, 10, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A'),
  ('TECH_MSFT', 2023, 2025, 14, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A'),
  ('TECH_MSFT', 2023, 2025, 15, null, false, 'excluded_no_activity', 12, 3, now(), 'Not a line in Table 1A')
on conflict (company_id, year, reporting_year, category) do nothing;

commit;
