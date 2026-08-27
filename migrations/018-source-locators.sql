-- 018-source-locators.sql
-- Make a source link land on the page the figure is actually on.
--
-- Felix, 2026-08-27: a link that opens a 10MB PDF at page 1 and leaves you hunting for a table is
-- barely a source at all. Every PDF viewer honours #page=N, so a reading that knows its page can
-- produce a link that opens exactly there.
--
-- Two fields rather than one:
--   source_page     the page, for the link
--   source_locator  what to look for once you are there, in words
--
-- The second matters because page numbers drift when a company re-issues a document, and a
-- locator that says "Emissions table, 2019 baseline column" survives that.

begin;

alter table public.scope12            add column if not exists source_page integer;
alter table public.scope12            add column if not exists source_locator text;
alter table public.scope3             add column if not exists source_page integer;
alter table public.scope3             add column if not exists source_locator text;
alter table public.company_year_review add column if not exists source_page integer;
alter table public.company_year_review add column if not exists source_locator text;

-- H&M's 2024 report: every figure we hold from it sits on page 34 — scope 1 and 2 totals in the
-- GHG emission reduction targets table, scope 3 in the category table below it. Verified by
-- extracting that page alone and finding all three.
update public.scope12 s
   set source_page = 34,
       source_locator = 'GHG emission reduction targets table — columns 2024, 2023, 2022, 2019 (Baseline)'
  from public.documents d
 where d.id = s.document_id
   and d.url = 'https://hmgroup.com/wp-content/uploads/2025/03/HM-Group-Annual-and-sustainability-report-2024.pdf';

update public.scope3 s
   set source_page = 34,
       source_locator = 'Scope 3 emissions by category table — columns 2024, 2023, 2022, 2019 (Baseline)'
  from public.documents d
 where d.id = s.document_id
   and d.url = 'https://hmgroup.com/wp-content/uploads/2025/03/HM-Group-Annual-and-sustainability-report-2024.pdf';

update public.company_year_review r
   set source_page = 34,
       source_locator = 'Emissions tables'
  from public.documents d
 where d.id = r.document_id
   and d.url = 'https://hmgroup.com/wp-content/uploads/2025/03/HM-Group-Annual-and-sustainability-report-2024.pdf';

-- A deep link, built once so every screen shows the same thing.
create or replace function public.source_link(p_url text, p_page integer)
returns text language sql immutable as $$
  select case
    when p_url is null then null
    when p_page is null then p_url
    else p_url || '#page=' || p_page
  end;
$$;

comment on function public.source_link(text, integer) is
  'A link that opens the document at the page the figure is on. Every PDF viewer honours #page=N.';

commit;
