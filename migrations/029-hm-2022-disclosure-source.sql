-- 029-hm-2022-disclosure-source.sql
-- H&M's originally-reported 2022 figures come from the Sustainability Disclosure 2022, not from
-- the Climate Transition Plan they were attributed to.
--
-- Proved 2026-08-27 by downloading the disclosure and finding the figures in it:
--   "20% (1,442kt) Use of sold products"      matches our category 11
--   "1% (92kt) End-of-life sold products"      matches our category 12
--   "5% (331kt) Transport"                     matches our category 4
--
-- The Climate Transition Plan, published a year later, gives 1,851kt for the same year — because
-- it restates history. Attributing the original figures to it made a restatement look like it
-- happened between the wrong pair of documents.
--
-- Scope 1 is NOT repointed. Our 13,899 for 2022 could not be found in either the Sustainability
-- Disclosure 2022 or the Annual and Sustainability Report 2022 — both give percentages rather
-- than a tonnage in their text. Leaving it attributed to a document that does not contain it
-- would be wrong, but so would moving it to another document that does not either.

begin;

insert into public.documents (company_id, doc_type, title, url, published_on, published_on_source, covers_fy, covers_fy_source, last_status, last_checked_at, notes)
values ('FASH_HM', 'sustainability_disclosure', 'H&M Group Sustainability Disclosure 2022',
        'https://hmgroup.com/wp-content/uploads/2023/03/HM-Group-Sustainability-Disclosure-2022.pdf',
        date '2023-03-01', 'read', 2022, 'read', 200, now(),
        'Found 2026-08-27 while resolving figures that did not match their cited source. Contains H&M''s originally reported 2022 scope 3 category figures.')
on conflict (url) do nothing;

update public.scope3 s
   set document_id = (select id from public.documents where url = 'https://hmgroup.com/wp-content/uploads/2023/03/HM-Group-Sustainability-Disclosure-2022.pdf'),
       notes = coalesce(s.notes || ' ', '') || 'Source corrected 2026-08-27: figure verified in the Sustainability Disclosure 2022.'
 where s.company_id = 'FASH_HM'
   and s.year = 2022
   and s.reporting_year = 2022
   and s.category in (4, 11, 12);

update public.company_year_review r
   set source_url = 'https://hmgroup.com/wp-content/uploads/2023/03/HM-Group-Sustainability-Disclosure-2022.pdf',
       document_id = (select id from public.documents where url = 'https://hmgroup.com/wp-content/uploads/2023/03/HM-Group-Sustainability-Disclosure-2022.pdf'),
       source_notes = coalesce(r.source_notes || ' ', '') || 'Source corrected 2026-08-27.'
 where r.company_id = 'FASH_HM' and r.year = 2022 and r.reporting_year = 2022;

commit;
