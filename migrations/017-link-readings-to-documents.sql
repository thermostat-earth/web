-- 017-link-readings-to-documents.sql
-- Point every reading at the document it came from.
--
-- Until now a reading's provenance was (company, year, reporting_year) joined to a source_url in
-- company_year_review — a string match, three tables deep. That is how H&M's 2021, 2022 and 2023
-- readings ended up looking like three separate reports when they all came from one climate
-- transition plan, and it is why "reported twice with a different figure" could not reliably mean
-- "two documents disagree".
--
-- After this, a restatement is exactly that: the same year, read from two documents, with
-- different numbers.

begin;

alter table public.company_year_review add column if not exists document_id bigint references public.documents(id);
alter table public.scope12            add column if not exists document_id bigint references public.documents(id);
alter table public.scope3             add column if not exists document_id bigint references public.documents(id);

-- The review rows carry the URL already, so they link directly.
update public.company_year_review r
   set document_id = d.id
  from public.documents d
 where d.url = r.source_url
   and r.document_id is null;

-- The emissions rows have no URL of their own. They inherit from the review row that describes
-- the same (company, year, reporting_year) — which is the only link that exists today, and the
-- reason this migration is worth doing once rather than repeating the join forever.
update public.scope12 s
   set document_id = r.document_id
  from public.company_year_review r
 where r.company_id = s.company_id
   and r.year = s.year
   and r.reporting_year = s.reporting_year
   and r.document_id is not null
   and s.document_id is null;

update public.scope3 s
   set document_id = r.document_id
  from public.company_year_review r
 where r.company_id = s.company_id
   and r.year = s.year
   and r.reporting_year = s.reporting_year
   and r.document_id is not null
   and s.document_id is null;

create index if not exists scope12_document_idx on public.scope12 (document_id);
create index if not exists scope3_document_idx  on public.scope3  (document_id);

commit;
