-- 026-hm-restatement-reasons-second-pass.sql
-- Reasons found on a deliberate second look at a document already read.
--
-- Felix asked, 2026-08-27, whether a re-check would turn up explanations missed first time
-- round. It did: four of the five unexplained restatements are explained on page 66 of the same
-- H&M report the figures came from, under "Improved data quality and calculations".
--
-- The first pass captured the figures and the headline restatement note, but not this section.
-- That is the strongest argument yet for the extractor capturing narrative as well as numbers.
--
-- All four are calculation changes, not boundary moves. The report says so, and it says the
-- changes were applied backwards: "All these changes have been applied to historical results" —
-- which is why the 2022 figures move in step with the 2023 ones the note describes.

begin;

update public.scope3 s
   set restatement_reason = 'Explained on page 66 of the 2024 Annual and Sustainability Report, under "Improved data quality and calculations": "We have used sales-country level waste statistics for domestic waste treatment, as well as exports and the end-point country waste treatments, which helped us to better estimate how products are moved and treated once they reach their end-of-life. These changes led to a decrease in emissions from end-of-life treatment by 30 percent or 26,613 tonnes CO2e for 2023." The report states these changes were applied to historical results, which is why 2022 moves in step. A calculation change, not a boundary change.',
       source_page = 66,
       source_locator = 'Improved data quality and calculations'
  from public.documents d
 where d.id = s.document_id
   and d.url = 'https://hmgroup.com/wp-content/uploads/2025/03/HM-Group-Annual-and-sustainability-report-2024.pdf'
   and s.company_id = 'FASH_HM' and s.category = 12 and s.year in (2022, 2023);

update public.scope3 s
   set restatement_reason = 'Explained on page 66 of the 2024 Annual and Sustainability Report, under "Improved data quality and calculations": "In addition to these, some minor changes were made within transports, franchise and employee commuting emission calculations." Thin — the company points to its climate reporting webpage for detail rather than giving it. A calculation change on its own account, and the movement is about 1 percent.',
       source_page = 66,
       source_locator = 'Improved data quality and calculations'
  from public.documents d
 where d.id = s.document_id
   and d.url = 'https://hmgroup.com/wp-content/uploads/2025/03/HM-Group-Annual-and-sustainability-report-2024.pdf'
   and s.company_id = 'FASH_HM' and s.category = 4 and s.year in (2022, 2023);

commit;
