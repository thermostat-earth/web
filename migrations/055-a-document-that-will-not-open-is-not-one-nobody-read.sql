-- 055 — a document that will not open is not one nobody read
--
-- Felix, 2026-09-05: "why are we still getting the never read thing it's sooo annoying."
--
-- Because the same document was being reported twice, under two different complaints. Chanel's
-- three documents return 403. They are counted in documents_unreachable, correctly — and then
-- counted AGAIN in documents_unread, because no figure cites them, which is inevitable for a file
-- nobody can open. One problem, two accusations, and the second one blames the reader.
--
-- "Never read" should mean we could have read it and did not. Where the document will not open,
-- that is already said once and does not need saying again in worse words.
--
-- Narrow on purpose: only a recorded non-200 excuses a document. A document that opens fine and
-- carries no figures is still a real finding, and still shows.

begin;

create or replace view public.unread_documents as
 SELECT d.id,
    d.company_id,
    c.company_name,
    d.title,
    d.url,
    d.published_on,
    'no figure anywhere in the database cites this document'::text AS problem
   FROM documents d
     JOIN companies c ON c.company_id = d.company_id
  WHERE d.read_no_figures_at IS NULL
    -- A file the server refuses is reported by documents_unreachable. Counting it here as well
    -- tells the reviewer the reading failed when the fetching did.
    AND (d.last_status IS NULL OR d.last_status = 200)
    AND NOT (EXISTS ( SELECT 1
           FROM scope3 s
          WHERE s.document_id = d.id))
    AND NOT (EXISTS ( SELECT 1
           FROM scope12 s
          WHERE s.document_id = d.id));

comment on view public.unread_documents is
  'Documents we hold, could open, and no figure cites — genuinely unread. Excludes documents whose '
  'last fetch was not a 200: those are already reported as unreachable, and reporting them here too '
  'blames the reader for a failure of the fetch.';

commit;
