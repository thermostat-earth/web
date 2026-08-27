-- 027-document-liveness.sql
-- Record whether a source document still resolves.
--
-- Found 2026-08-27 while chasing an unexplained restatement: H&M's Climate Transition Plan URL
-- returns 404. That document is the "as first reported" side of most of our H&M restatement
-- candidates, so the evidence for one half of those comparisons is currently unreachable.
--
-- Checked all fourteen. Two states worth telling apart:
--   404  gone. H&M's climate transition plan.
--   403  refuses an automated request. All three Chanel documents — chanel.com blocks curl but
--        the files may open fine in a browser, so this is "cannot verify", not "missing".
--
-- A source you cannot open is not much of a source, and link rot is silent. This stores the last
-- check so a dead link is visible on the review page rather than discovered by someone clicking.

begin;

alter table public.documents add column if not exists last_checked_at timestamptz;
alter table public.documents add column if not exists last_status integer;
alter table public.documents add column if not exists liveness_note text;

update public.documents set last_checked_at = now(), last_status = v.code, liveness_note = v.note
from (values
  ('https://hmgroup.com/wp-content/uploads/2024/03/HM-Group-Climate-Transition-Plan.pdf', 404,
   'GONE. Returns H&M''s "Page not found". This is the source of H&M''s originally reported 2021, 2022 and 2023 figures, so the "as first reported" side of most of their restatements cannot currently be opened. A replacement URL needs finding.'),
  ('https://www.chanel.com/puls-img/1721311324579-chanelsustainabilityperformanceextract2023pdf.pdf', 403,
   'chanel.com refuses automated requests. May well open in a browser — treat as unverified, not missing.'),
  ('https://www.chanel.com/puls-img/1765449310899-climate-transition-plan.pdf', 403,
   'chanel.com refuses automated requests. May well open in a browser — treat as unverified, not missing.'),
  ('https://www.chanel.com/puls-img/1785315373338-vf-chanel-sustainability-extract-2025.pdf', 403,
   'chanel.com refuses automated requests. May well open in a browser — treat as unverified, not missing.')
) as v(url, code, note)
where documents.url = v.url;

update public.documents set last_checked_at = now(), last_status = 200,
       liveness_note = 'Resolves and returns a PDF.'
 where last_status is null;

commit;
