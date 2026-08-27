-- 015-documents.sql
-- A document is a thing in its own right.
--
-- Two separate problems land on the same answer:
--
--   1. reporting_year does not identify a report. H&M's 2021, 2022 and 2023 readings all come
--      from ONE document — the Climate Transition Plan published March 2024 — under three
--      different reporting years. A restatement is the difference between two documents, so
--      detection is unreliable while a document has no identity.
--
--   2. Watching for "the next annual report" misses everything else. H&M publish an annual
--      report AND a climate transition plan; ITV publish a social purpose report, an annual
--      report and a climate transition plan. Cadence belongs to a series, not to a company.
--
-- Seeded from the twelve distinct documents already referenced by readings. Where a field could
-- not be read from the document or its URL it is left null rather than guessed — published_on is
-- known only for the two H&M files, whose URLs carry the date.

begin;

create table if not exists public.documents (
  id            bigint generated always as identity primary key,
  company_id    text not null references public.companies(company_id) on delete cascade,
  doc_type      text,          -- annual_report, sustainability_report, climate_transition_plan, ...
  title         text,
  url           text not null unique,
  published_on  date,          -- when the document itself was published
  covers_fy     integer,       -- the fiscal year it principally reports on
  covers_fy_source text,       -- 'read' if taken from the document, 'derived' if inferred
  retrieved_at  timestamptz,
  notes         text,
  created_at    timestamptz not null default now()
);

comment on table public.documents is
  'Every document a company has published that we have read a figure from. Cadence, restatement detection and the new-document watcher all key off this.';

create index if not exists documents_company_idx on public.documents (company_id, doc_type, published_on desc);

-- Seed from what the readings already reference. covers_fy is DERIVED from the highest
-- reporting_year of the readings that cite each document, not read from the document itself —
-- flagged as such so nobody mistakes it for a fact off the page.
insert into public.documents (company_id, doc_type, title, url, covers_fy, covers_fy_source, notes)
select
  v.company_id,
  v.doc_type,
  v.title,
  v.url,
  (select max(r.reporting_year) from public.company_year_review r where r.source_url = v.url),
  'derived',
  'Seeded 2026-08-27 from the documents already cited by readings.'
from (values
  ('FASH_HM','climate_transition_plan','H&M Group Climate Transition Plan','https://hmgroup.com/wp-content/uploads/2024/03/HM-Group-Climate-Transition-Plan.pdf'),
  ('FASH_HM','annual_and_sustainability_report','H&M Group Annual and Sustainability Report 2024','https://hmgroup.com/wp-content/uploads/2025/03/HM-Group-Annual-and-sustainability-report-2024.pdf'),
  ('FASH_CHAN','sustainability_report','Chanel Sustainability Performance Extract 2023','https://www.chanel.com/puls-img/1721311324579-chanelsustainabilityperformanceextract2023pdf.pdf'),
  ('FASH_CHAN','climate_transition_plan','Chanel Climate Transition Plan','https://www.chanel.com/puls-img/1765449310899-climate-transition-plan.pdf'),
  ('MEDIA_ITV','social_purpose_report','ITV Social Purpose Report 2021','https://www.itvplc.com/~/media/Files/I/ITV-PLC-V2/downloads/itv-social-purpose-report-2021.pdf'),
  ('MEDIA_ITV','social_purpose_report','ITV Social Purpose Report 2022','https://www.itvplc.com/~/media/Files/I/ITV-PLC-V2/documents/2022-itv-social-purpose-report.pdf'),
  ('MEDIA_ITV','social_purpose_report','ITV Social Purpose Report 2023','https://www.itvplc.com/~/media/Files/I/ITV-PLC-V2/documents/2023-itv-social-purpose-report.pdf'),
  ('MEDIA_ITV','climate_transition_plan','ITV Climate Transition Plan 2024','https://www.itvplc.com/~/media/Files/I/ITV-PLC-V2/documents/2024-climate-transition-plan-report.pdf'),
  ('MEDIA_ITV','annual_report','ITV plc Annual Report and Accounts 2023','https://www.itvplc.com/~/media/Files/I/ITV-PLC-V2/documents/investors/result-centre/ITV%20Plc%202023%20Annual%20Report%20and%20Accounts%20250324.pdf'),
  ('MEDIA_ITV','annual_report','ITV plc Annual Report and Accounts 2024','https://www.itvplc.com/~/media/Files/I/ITV-PLC-V2/FY%202024%20Results/2024%20Annual%20report%20and%20Accounts.pdf'),
  ('TECH_MSFT','data_fact_sheet','Microsoft 2024 Environmental Sustainability Report Data Fact Sheet','https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/msc/documents/presentations/CSR/2024-Environmental-Sustainability-Report-Data-Fact.pdf'),
  ('TECH_MSFT','data_fact_sheet','Microsoft 2025 Environmental Data Fact Sheet','https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/msc/documents/presentations/CSR/2025-Microsoft-Environmental-Data-Fact-Sheet-PDF.pdf')
) as v(company_id, doc_type, title, url)
on conflict (url) do nothing;

-- The only two publication dates that can be read without opening a file: H&M put them in the path.
update public.documents set published_on = date '2024-03-01', notes = notes || ' Publication date taken from the URL path (/2024/03/).'
 where url = 'https://hmgroup.com/wp-content/uploads/2024/03/HM-Group-Climate-Transition-Plan.pdf';
update public.documents set published_on = date '2025-03-01', notes = notes || ' Publication date taken from the URL path (/2025/03/).'
 where url = 'https://hmgroup.com/wp-content/uploads/2025/03/HM-Group-Annual-and-sustainability-report-2024.pdf';

-- The one we know exists and have never read. No readings cite it, so covers_fy stays null.
insert into public.documents (company_id, doc_type, title, url, published_on, notes)
values ('FASH_HM','annual_and_sustainability_report','H&M Group Annual and Sustainability Report 2025',
        'https://hmgroup.com/wp-content/uploads/2026/03/HM-Group-Annual-and-sustainability-report-2025.pdf',
        date '2026-03-01',
        'Found 2026-08-27 while checking how far back H&M report. NOT READ — published five months ago and nothing told us. This is the document the watcher must find to prove it works.')
on conflict (url) do nothing;

commit;
