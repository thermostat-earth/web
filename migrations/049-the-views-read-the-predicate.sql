-- 049: the two views read the predicate, so nothing re-derives it.
--
-- restatements_for_review gains `company_explained`, and evidence_health counts the unexplained
-- off that column rather than off an emptiness test. Both were computing "did the company explain
-- this" independently, and both got it wrong the moment we started recording our own findings in
-- the reason field. See 048 for the full story.
--
-- Generated from the live view definitions and patched in two places, rather than retyped: these
-- views carry a lot of source-link plumbing that has nothing to do with this change and every
-- retyping of it is a chance to lose a join.

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
        ,
    public.is_company_explanation(
        CASE
            WHEN r.measure = 'scope1'::text THEN ( SELECT s.restatement_reason
               FROM scope12 s
              WHERE s.company_id = r.company_id AND s.year = r.year AND s.reporting_year = r.last_reported_in)
            ELSE ( SELECT s.restatement_reason
               FROM scope3 s
              WHERE s.company_id = r.company_id AND s.year = r.year AND s.category = r.category AND s.reporting_year = r.last_reported_in)
        END) AS company_explained
   FROM restatements_detected r
     JOIN companies c ON c.company_id = r.company_id;
;

create or replace view public.evidence_health as
 SELECT company_id,
    company_name,
    ( SELECT count(*) AS count
           FROM documents d
          WHERE d.company_id = c.company_id) AS documents,
    ( SELECT count(*) AS count
           FROM documents d
          WHERE d.company_id = c.company_id AND d.last_status <> 200) AS documents_unreachable,
    ( SELECT count(*) AS count
           FROM documents d
          WHERE d.company_id = c.company_id AND d.published_on IS NULL) AS documents_undated,
    ( SELECT count(*) AS count
           FROM unverified_figures u
          WHERE u.company_id = c.company_id) AS figures_unverified,
    ( SELECT count(*) AS count
           FROM restatements_for_review r
          WHERE r.company_id = c.company_id) AS restatements,
    ( SELECT count(*) AS count
           FROM restatements_for_review r
          WHERE r.company_id = c.company_id AND NOT r.company_explained) AS restatements_unexplained,
    ( SELECT count(*) AS count
           FROM capture_gaps g
          WHERE g.company_id = c.company_id) AS reports_with_gaps,
    ( SELECT count(*) AS count
           FROM publication_coverage_gaps p
          WHERE p.company_id = c.company_id) AS publications_part_read,
    ( SELECT count(*) AS count
           FROM unread_documents u
          WHERE u.company_id = c.company_id) AS documents_unread
   FROM companies c;
;

comment on view public.restatements_for_review is
  'Every detected restatement with the company''s own words and links to both publications. company_explained says whether that reason is the company explaining itself or our record that it did not.';
