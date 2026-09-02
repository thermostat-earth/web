-- 037: read ITV's 2021 Social Purpose Report, which we had held and never opened.
--
-- Felix, 2026-09-02: "cant we just have the process that all reports get read once they're found."
-- Yes. This is that, applied to the backlog rather than argued about.
--
-- It gives ITV two years of history we did not have — 2019 and 2020 — for scope 1, scope 2 and
-- every scope 3 category ITV reports. That matters beyond tidiness: a score needs three or more
-- consecutive years on one basis, and ITV's history started at 2021 until now.
--
-- Checked against the document's own stated Scope 3 total before writing, for all three years:
--   2019   890,333 vs 890,333 stated   exact
--   2020   773,664 vs 773,664 stated   exact
--   2021   712,301 vs 712,301 stated   exact
-- 2021 itself is not inserted: rows for that year already exist, wrongly citing the 2022 report.
-- Straightening out ITV's document attributions is its own job and does not belong inside a capture.

begin;

insert into public.scope12
  (company_id, year, reporting_year, scope1_ghg,
   scope2_location_disclosed, scope2_location_ghg, scope2_market_disclosed, scope2_market_ghg,
   document_id, source_page, verified_at, verified_note)
values
  ('MEDIA_ITV', 2019, 2021, 3401, true, 13563, true, 8341, 5, null, now(), 'Greenhouse gas emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2020, 2021, 2554, true,  9892, true, 5549, 5, null, now(), 'Greenhouse gas emissions table, ITV Social Purpose Report 2021')
on conflict (company_id, year, reporting_year) do nothing;

insert into public.scope3
  (company_id, year, reporting_year, category, ghg, reported, not_reported_reason,
   document_id, source_page, verified_at, verified_note)
values
  -- 2019
  ('MEDIA_ITV', 2019, 2021,  1, 382305, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2019, 2021,  2,    836, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2019, 2021,  3,   4288, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2019, 2021,  4,   7374, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2019, 2021,  5,     21, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2019, 2021,  6,  43618, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2019, 2021,  7,   4848, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2019, 2021,  8,  24336, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2019, 2021, 11, 399534, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2019, 2021, 15,  23173, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2019, 2021,  9, null, false, 'not_disclosed', 5, null, now(), 'Not a line in the GHG emissions table'),
  ('MEDIA_ITV', 2019, 2021, 10, null, false, 'not_disclosed', 5, null, now(), 'Not a line in the GHG emissions table'),
  ('MEDIA_ITV', 2019, 2021, 12, null, false, 'not_disclosed', 5, null, now(), 'Not a line in the GHG emissions table'),
  ('MEDIA_ITV', 2019, 2021, 13, null, false, 'not_disclosed', 5, null, now(), 'Not a line in the GHG emissions table'),
  ('MEDIA_ITV', 2019, 2021, 14, null, false, 'not_disclosed', 5, null, now(), 'Not a line in the GHG emissions table'),
  -- 2020
  ('MEDIA_ITV', 2020, 2021,  1, 345097, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2020, 2021,  2,   1779, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2020, 2021,  3,   3638, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2020, 2021,  4,   1713, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2020, 2021,  5,     10, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2020, 2021,  6,  13650, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2020, 2021,  7,   5127, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2020, 2021,  8,   8760, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2020, 2021, 11, 373578, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2020, 2021, 15,  20312, true, null, 5, null, now(), 'GHG emissions table, ITV Social Purpose Report 2021'),
  ('MEDIA_ITV', 2020, 2021,  9, null, false, 'not_disclosed', 5, null, now(), 'Not a line in the GHG emissions table'),
  ('MEDIA_ITV', 2020, 2021, 10, null, false, 'not_disclosed', 5, null, now(), 'Not a line in the GHG emissions table'),
  ('MEDIA_ITV', 2020, 2021, 12, null, false, 'not_disclosed', 5, null, now(), 'Not a line in the GHG emissions table'),
  ('MEDIA_ITV', 2020, 2021, 13, null, false, 'not_disclosed', 5, null, now(), 'Not a line in the GHG emissions table'),
  ('MEDIA_ITV', 2020, 2021, 14, null, false, 'not_disclosed', 5, null, now(), 'Not a line in the GHG emissions table')
on conflict (company_id, year, reporting_year, category) do nothing;

commit;
