-- 028-hm-ctp-url-and-mismatch.sql
-- H&M's Climate Transition Plan has moved, and reading it raises a bigger question.
--
-- New URL found 2026-08-27: the file is now at /2024/03/Climate-Transition-Plan.pdf — H&M
-- dropped the "HM-Group-" prefix. Downloaded and verified: 6.2MB, 1818 lines of text, the scope 3
-- table intact.
--
-- The table gives columns 2019, 2021, 2022, 2023 and reads:
--   Direct emissions (scope 1)   23,024 · 20,294 · 17,796 · 16,354
--   Use of sold products (cat 11) 2,499 · 2,021 · 1,851 · 1,659  (ktonnes)
-- Internally consistent — scope 1 plus scope 2 equals the stated scope 1+2 total in every column.
--
-- But the readings we attribute TO this document do not match it:
--   we hold 2022 scope 1 = 13,899;  the document says 17,796
--   we hold 2022 cat 11  = 1,442,000; the document says 1,851,000
--
-- The likeliest explanation is not that the figures are wrong but that the SOURCE is: those look
-- like originally-reported figures from H&M's own 2022 reporting, attributed to a 2024 document
-- that restates history. If so, the source_url has been wrong all along, and the restatements we
-- have been discussing all day are between the real 2022 report and the 2024 annual report — with
-- the transition plan sitting in the middle, uncaptured.
--
-- Not resolved here. The URL is corrected and the discrepancy recorded, because guessing which
-- of the two figures is right is exactly the judgement this system exists to put in front of a
-- human with the evidence attached.

begin;

update public.documents
   set url = 'https://hmgroup.com/wp-content/uploads/2024/03/Climate-Transition-Plan.pdf',
       last_status = 200,
       last_checked_at = now(),
       liveness_note = 'Relocated: H&M dropped the "HM-Group-" prefix. Old URL returned 404. Verified 2026-08-27 — downloads as a 6.2MB PDF.',
       notes = coalesce(notes,'') || ' URL corrected 2026-08-27 after the original 404ed.'
 where url = 'https://hmgroup.com/wp-content/uploads/2024/03/HM-Group-Climate-Transition-Plan.pdf';

update public.company_year_review
   set source_url = 'https://hmgroup.com/wp-content/uploads/2024/03/Climate-Transition-Plan.pdf'
 where source_url = 'https://hmgroup.com/wp-content/uploads/2024/03/HM-Group-Climate-Transition-Plan.pdf';

commit;
