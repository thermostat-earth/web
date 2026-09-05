-- 054 — say which years the company chose not to print
--
-- Migration 053 separated "no report we hold reaches this year" (our gap, and a blocker) from "a
-- report we hold spans the year and does not print it" (the company's choice, and a finding). The
-- second is now recorded in capture_gaps.years_no_report_prints and NOTHING SHOWS IT, which is the
-- failure this whole week has been about: a machine that knows something and has no way to say it.
--
-- So it reaches evidence_health, which is what review-ready reads, so it can appear on the review
-- page as a completeness note rather than a blocker. Felix, 2026-09-05, on wanting to score
-- companies that are not complete: "clear flags when companies aren't complete."
--
-- Deliberately NOT a count. "H&M does not print 2020" is a useful sentence; "H&M: 1" is the kind of
-- number that gets read as a fault in us.

begin;

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
          WHERE d.company_id = c.company_id AND d.published_on IS NULL AND NOT (EXISTS ( SELECT 1
                   FROM documents d2
                  WHERE d2.company_id = d.company_id AND NOT d2.covers_fy IS DISTINCT FROM d.covers_fy AND d2.published_on IS NOT NULL))) AS documents_undated,
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
          WHERE u.company_id = c.company_id) AS documents_unread,
    -- The years no report we hold PRINTS, though a report we hold spans them. Not a blocker: this is
    -- the company's editorial choice about which columns to publish, and it is exactly the kind of
    -- fact the score exists to expose. capture_gaps only emits a row for OUR gaps, so this is
    -- computed here directly rather than joined from it.
    ( SELECT array_agg(g.yr ORDER BY g.yr)
        FROM ( SELECT DISTINCT year FROM public.scope12 s
                WHERE s.company_id = c.company_id AND s.scope1_ghg IS NOT NULL) held
        RIGHT JOIN LATERAL generate_series(
               (SELECT min(year) FROM public.scope12 s WHERE s.company_id = c.company_id AND s.scope1_ghg IS NOT NULL),
               (SELECT max(year) FROM public.scope12 s WHERE s.company_id = c.company_id AND s.scope1_ghg IS NOT NULL)
             ) g(yr) ON held.year = g.yr
       WHERE held.year IS NULL) AS years_not_printed
   FROM companies c;

comment on column public.evidence_health.years_not_printed is
  'Years inside the company''s own reporting span that no report we hold prints. The company''s '
  'choice, not our gap — a completeness flag for the review page, never a blocker.';

commit;
