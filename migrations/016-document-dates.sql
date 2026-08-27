-- 016-document-dates.sql
-- Publication dates for the backfill, and an honest note on how each was established.
--
-- Three sources, in descending order of trust:
--   read      taken from the document or its URL path
--   announced confirmed against a news report of the publication
--   file      the server's last-modified header, which is when the FILE was last uploaded
--
-- The last one is a hint, not a fact, and ITV shows why: their 2021 social purpose report reports
-- a last-modified of February 2024. That is a site migration, not a publication. So the header is
-- stored separately and only promoted to published_on where it is plausible for that series.

begin;

alter table public.documents add column if not exists file_last_modified timestamptz;
alter table public.documents add column if not exists published_on_source text;

update public.documents set published_on_source = 'read'
 where published_on is not null and published_on_source is null;

-- Server file dates, recorded as evidence for all of them.
update public.documents set file_last_modified = v.lm
from (values
  ('https://www.itvplc.com/~/media/Files/I/ITV-PLC-V2/downloads/itv-social-purpose-report-2021.pdf', timestamptz '2024-02-20 06:36:42+00'),
  ('https://www.itvplc.com/~/media/Files/I/ITV-PLC-V2/documents/2022-itv-social-purpose-report.pdf', timestamptz '2024-02-08 09:37:35+00'),
  ('https://www.itvplc.com/~/media/Files/I/ITV-PLC-V2/documents/2023-itv-social-purpose-report.pdf', timestamptz '2024-03-22 17:52:36+00'),
  ('https://www.itvplc.com/~/media/Files/I/ITV-PLC-V2/documents/2024-climate-transition-plan-report.pdf', timestamptz '2024-03-22 17:58:47+00'),
  ('https://www.itvplc.com/~/media/Files/I/ITV-PLC-V2/documents/investors/result-centre/ITV%20Plc%202023%20Annual%20Report%20and%20Accounts%20250324.pdf', timestamptz '2024-03-25 14:46:01+00'),
  ('https://www.itvplc.com/~/media/Files/I/ITV-PLC-V2/FY%202024%20Results/2024%20Annual%20report%20and%20Accounts.pdf', timestamptz '2025-03-25 11:07:02+00'),
  ('https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/msc/documents/presentations/CSR/2024-Environmental-Sustainability-Report-Data-Fact.pdf', timestamptz '2024-11-06 16:04:58+00'),
  ('https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/msc/documents/presentations/CSR/2025-Microsoft-Environmental-Data-Fact-Sheet-PDF.pdf', timestamptz '2025-05-29 15:06:41+00')
) as v(url, lm)
where documents.url = v.url;

-- Promote the file date only where it fits the series. ITV publish annual results in March; the
-- filename of the 2023 report even carries 250324. Microsoft's 2025 fact sheet lands in May,
-- matching their environmental reporting cadence.
update public.documents
   set published_on = file_last_modified::date, published_on_source = 'file'
 where url in (
   'https://www.itvplc.com/~/media/Files/I/ITV-PLC-V2/documents/investors/result-centre/ITV%20Plc%202023%20Annual%20Report%20and%20Accounts%20250324.pdf',
   'https://www.itvplc.com/~/media/Files/I/ITV-PLC-V2/FY%202024%20Results/2024%20Annual%20report%20and%20Accounts.pdf',
   'https://www.itvplc.com/~/media/Files/I/ITV-PLC-V2/documents/2024-climate-transition-plan-report.pdf',
   'https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/msc/documents/presentations/CSR/2025-Microsoft-Environmental-Data-Fact-Sheet-PDF.pdf'
 );

-- Chanel's is confirmed by a news report rather than by the file, which carries no date at all.
update public.documents
   set published_on = date '2026-03-10', published_on_source = 'announced',
       notes = coalesce(notes,'') || ' Publication confirmed by ESG Dive, 17 March 2026, reporting that Chanel "publicly unveiled its first climate transition plan last week" — so the date is accurate to within about a week, not to the day.'
 where url = 'https://www.chanel.com/puls-img/1765449310899-climate-transition-plan.pdf';

-- Another document we have never read, found in the same search.
insert into public.documents (company_id, doc_type, title, url, notes)
values ('FASH_CHAN','sustainability_report','Chanel Sustainability Extract 2025',
        'https://www.chanel.com/puls-img/1785315373338-vf-chanel-sustainability-extract-2025.pdf',
        'Found 2026-08-27 while looking for publication dates. NOT READ. Chanel''s figures currently come from the 2023 extract and the climate transition plan, so this is very likely to restate them.')
on conflict (url) do nothing;

commit;
