-- 051: an undated document only counts against us when it is the only source for its year.
--
-- Felix, 2026-09-04: "ITV is still not in the review section." It was held out by exactly one
-- thing: a 2023 Social Purpose Report with no date. Its PDF metadata reads 2018, which is a
-- template artefact, and the document prints no date anywhere - so there is no honest date to give
-- it, and inventing one would decide which reading of a year is authoritative on no evidence.
--
-- But the rule was too blunt, and I should have seen that rather than asking him. The reason a
-- date matters is to establish WHICH PUBLICATION IS NEWEST for a data year, because the newest
-- reading wins. An undated document sitting beside a dated one covering the same year cannot win
-- that contest whatever its date turns out to be. It is only load-bearing when it is the sole
-- source for its year, and then the block is right.
--
-- So the count now asks the question that actually matters, rather than the one that was easy.

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
          WHERE d.company_id = c.company_id AND d.published_on IS NULL
            AND NOT EXISTS (SELECT 1 FROM documents d2
                             WHERE d2.company_id = d.company_id
                               AND d2.covers_fy IS NOT DISTINCT FROM d.covers_fy
                               AND d2.published_on IS NOT NULL)) AS documents_undated,
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

select company_id, documents, documents_undated from public.evidence_health where company_id = 'MEDIA_ITV';
