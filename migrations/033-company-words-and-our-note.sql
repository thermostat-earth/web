-- 033: a restatement carries the company's words and our note in separate fields.
--
-- Felix, 2026-09-02: "Yep good to have both fields."
--
-- Why. `restatement_reason` was doing two jobs at once — sometimes the company's own explanation,
-- sometimes a reviewer's note *about* that explanation. Step 2 of RESTATEMENT-METHODOLOGY.md turns
-- on whether the company explained itself, and the app was answering that by asking whether the
-- field was empty. Three ITV restatements therefore counted as explained while the text in the
-- field said, in terms, that ITV gave no reason — including category 11, which more than doubled
-- (+90.9%) with nothing said. Four of our seventeen restatements are unexplained, not one.
--
-- After this migration:
--   restatement_reason  the company's own words, and nothing else. Empty means unexplained.
--   restatement_note    ours: where we found it, how thin it is, what we make of it.
--
-- The constraint at the bottom is the point. Writing "put the company's words in the reason field"
-- into a document is the weakest kind of rule; a check that refuses to store a reviewer's note in
-- the company's field cannot be forgotten.

begin;

alter table public.scope12 add column if not exists restatement_note text;
alter table public.scope3  add column if not exists restatement_note text;

comment on column public.scope12.restatement_reason is
  'The company''s own words for why this figure changed. Nothing else. Empty means unexplained, and step 2 of the restatement methodology acts on that.';
comment on column public.scope3.restatement_reason is
  'The company''s own words for why this figure changed. Nothing else. Empty means unexplained, and step 2 of the restatement methodology acts on that.';
comment on column public.scope12.restatement_note is
  'Our note about the restatement: where the explanation was found, how thin it is, what we make of it. Never the company''s words.';
comment on column public.scope3.restatement_note is
  'Our note about the restatement: where the explanation was found, how thin it is, what we make of it. Never the company''s words.';

-- 1. A recorded absence is our note, not their explanation. Moves ITV's three rows wholesale.
update public.scope12
   set restatement_note = restatement_reason, restatement_reason = null
 where restatement_reason ~* 'reason not (explicitly )?stated|not explicitly stated|no reason (was )?given|no explanation (was )?given';
update public.scope3
   set restatement_note = restatement_reason, restatement_reason = null
 where restatement_reason ~* 'reason not (explicitly )?stated|not explicitly stated|no reason (was )?given|no explanation (was )?given';

-- 2. "Restated from 5072000." is our bookkeeping, and the row already carries the prior figure in
--    first_ghg. Stripped only where the number in the text matches the figure we hold, so a
--    mismatch is left alone to be looked at rather than quietly tidied away.
update public.scope3 s
   set restatement_reason = btrim(regexp_replace(restatement_reason, '^Restated from [0-9]+\.\s*', ''))
 where restatement_reason ~ '^Restated from [0-9]+\.'
   and (regexp_match(restatement_reason, '^Restated from ([0-9]+)\.'))[1]::numeric =
       (select p.ghg from public.scope3 p
         where p.company_id = s.company_id and p.year = s.year and p.category = s.category
           and p.reporting_year < s.reporting_year
         order by p.reporting_year asc limit 1);

-- 3. H&M's page 66 rows: the company's sentence out of our commentary around it. Done by hand
--    because there is no rule that separates a quotation from the prose framing it.
update public.scope3
   set restatement_reason = 'In addition to these, some minor changes were made within transports, franchise and employee commuting emission calculations.',
       restatement_note   = 'H&M 2024 Annual and Sustainability Report, page 66, under "Improved data quality and calculations". Thin — the company points to its climate reporting webpage for detail rather than giving it. A calculation change on its own account, and the movement is about 1 percent.'
 where company_id = 'FASH_HM' and category = 4 and reporting_year = 2024 and year in (2022, 2023);

update public.scope3
   set restatement_reason = 'We have used sales-country level waste statistics for domestic waste treatment, as well as exports and the end-point country waste treatments, which helped us to better estimate how products are moved and treated once they reach their end-of-life. These changes led to a decrease in emissions from end-of-life treatment by 30 percent or 26,613 tonnes CO2e for 2023.',
       restatement_note   = 'H&M 2024 Annual and Sustainability Report, page 66, under "Improved data quality and calculations". The report states these changes were applied to historical results, which is why 2022 moves in step. A calculation change, not a boundary change.'
 where company_id = 'FASH_HM' and category = 12 and reporting_year = 2024 and year in (2022, 2023);

-- 4. Tier 1: the wrong thing can no longer be stored.
alter table public.scope12 drop constraint if exists scope12_restatement_reason_is_theirs;
alter table public.scope3  drop constraint if exists scope3_restatement_reason_is_theirs;
alter table public.scope12 add constraint scope12_restatement_reason_is_theirs
  check (restatement_reason !~* 'reason not (explicitly )?stated|not explicitly stated|no reason (was )?given|no explanation (was )?given');
alter table public.scope3 add constraint scope3_restatement_reason_is_theirs
  check (restatement_reason !~* 'reason not (explicitly )?stated|not explicitly stated|no reason (was )?given|no explanation (was )?given');

-- 5. The review view carries both. Appended at the end: create-or-replace cannot insert a column
--    into the middle of an existing view (learned the hard way on 2026-08-28).
create or replace view public.restatements_for_review as
 SELECT r.company_id,
    c.company_name,
    c.sector,
    r.year,
    r.measure,
    r.category,
    r.readings,
    r.documents,
    r.any_date_assumed,
    r.first_reported_in,
    r.first_ghg,
    r.last_reported_in,
    r.last_ghg,
    r.change,
    r.pct_change,
        CASE
            WHEN r.measure = 'scope1'::text THEN ( SELECT s.restatement_reason
               FROM scope12 s
              WHERE s.company_id = r.company_id AND s.year = r.year AND s.reporting_year = r.last_reported_in)
            ELSE ( SELECT s.restatement_reason
               FROM scope3 s
              WHERE s.company_id = r.company_id AND s.year = r.year AND s.category = r.category AND s.reporting_year = r.last_reported_in)
        END AS company_stated_reason,
    ( SELECT source_link(v.source_url, v.source_page) AS source_link
           FROM company_year_review v
          WHERE v.company_id = r.company_id AND v.year = r.year AND v.reporting_year = r.first_reported_in) AS first_source_url,
    ( SELECT v.source_notes
           FROM company_year_review v
          WHERE v.company_id = r.company_id AND v.year = r.year AND v.reporting_year = r.first_reported_in) AS first_source_notes,
    ( SELECT source_link(v.source_url, v.source_page) AS source_link
           FROM company_year_review v
          WHERE v.company_id = r.company_id AND v.year = r.year AND v.reporting_year = r.last_reported_in) AS last_source_url,
    ( SELECT v.source_notes
           FROM company_year_review v
          WHERE v.company_id = r.company_id AND v.year = r.year AND v.reporting_year = r.last_reported_in) AS last_source_notes,
    ( SELECT v.source_page
           FROM company_year_review v
          WHERE v.company_id = r.company_id AND v.year = r.year AND v.reporting_year = r.first_reported_in) AS first_source_page,
    ( SELECT v.source_page
           FROM company_year_review v
          WHERE v.company_id = r.company_id AND v.year = r.year AND v.reporting_year = r.last_reported_in) AS last_source_page,
        CASE
            WHEN r.measure = 'scope1'::text THEN ( SELECT s.restatement_note
               FROM scope12 s
              WHERE s.company_id = r.company_id AND s.year = r.year AND s.reporting_year = r.last_reported_in)
            ELSE ( SELECT s.restatement_note
               FROM scope3 s
              WHERE s.company_id = r.company_id AND s.year = r.year AND s.category = r.category AND s.reporting_year = r.last_reported_in)
        END AS our_note
   FROM restatements_detected r
     JOIN companies c ON c.company_id = r.company_id;

grant select on public.restatements_for_review to anon, authenticated;

commit;
