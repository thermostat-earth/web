-- Two things a reviewer needs in order to judge a restatement rather than trust one.
--
-- Felix, 2026-08-28.
--
-- 1. Page numbers on the source links. "As first reported (2022)" makes you open a 200-page PDF
--    and hunt. The page is already known -- source_link() has been folding it into the URL as a
--    fragment for months -- it just was not exposed as a number the page could print.
--
-- 2. year_totals_by_publication. The new "they moved it between categories, the total is the
--    same" verdict states a condition and nothing checks it. This is what makes the check
--    possible: for one company and one year, what the whole footprint came to in each
--    publication that reported it. Compare the two and the claim is either true or it is not.
--
--    Deliberately the WHOLE footprint, not the scored basket. The basket is decided inside the
--    scoring function and depends on the run; recomputing it here would be a second definition
--    that drifts from the first. A total that is unchanged across every category is a stronger
--    claim than one that survives inside the basket, so this errs toward blocking.

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
    -- Appended at the end deliberately: create-or-replace cannot insert a column in the middle
    -- of an existing view, it can only add to the end. Tried it the tidy way first, 2026-08-28.
    ( SELECT v.source_page
           FROM company_year_review v
          WHERE v.company_id = r.company_id AND v.year = r.year AND v.reporting_year = r.first_reported_in) AS first_source_page,
    ( SELECT v.source_page
           FROM company_year_review v
          WHERE v.company_id = r.company_id AND v.year = r.year AND v.reporting_year = r.last_reported_in) AS last_source_page
   FROM restatements_detected r
     JOIN companies c ON c.company_id = r.company_id;

create or replace view public.year_totals_by_publication as
  select
    coalesce(s3.company_id, s12.company_id)         as company_id,
    coalesce(s3.year, s12.year)                     as year,
    coalesce(s3.reporting_year, s12.reporting_year) as reporting_year,
    s12.scope12_ghg,
    s3.scope3_ghg,
    -- Null-safe: a publication that gave scope 3 but not scope 1 and 2 still has a comparable
    -- scope 3 total, and saying "unknown" there would block a judgement the evidence supports.
    coalesce(s12.scope12_ghg, 0) + coalesce(s3.scope3_ghg, 0) as total_ghg,
    s3.categories_counted
  from (
    select company_id, year, reporting_year,
           sum(ghg)   as scope3_ghg,
           count(*)   as categories_counted
    from scope3
    where row_status = 'ok' and ghg is not null
    group by company_id, year, reporting_year
  ) s3
  full join (
    -- Location-based scope 2, because it is the one every company reports. Market-based is
    -- optional and its absence would silently change the total between publications.
    select company_id, year, reporting_year,
           sum(coalesce(scope1_ghg, 0) + coalesce(scope2_location_ghg, 0)) as scope12_ghg
    from scope12
    group by company_id, year, reporting_year
  ) s12
    on  s12.company_id     = s3.company_id
    and s12.year           = s3.year
    and s12.reporting_year = s3.reporting_year;

comment on view public.year_totals_by_publication is
  'One row per company/year/publication: what the whole footprint came to in that publication. Used to test a "moved between categories" verdict — if the total moved, it was not just a move.';

grant select on public.year_totals_by_publication to anon, authenticated;
