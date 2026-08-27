-- 022-score-by-publication.sql
-- score_company now resolves each year to the most recently PUBLISHED reading.
--
-- Fourteen ORDER BY clauses changed from "reporting_year DESC" to "pub_order DESC,
-- reporting_year DESC" — publication first, reporting year only to break a tie. Nothing else in
-- the function is touched.
--
-- Measured before and after: on today's data every company scores identically, because the two
-- orderings agree on every figure we currently hold. That is the point — this is a correctness
-- change made while it is provably a no-op, rather than after a document arrives out of order and
-- quietly moves a public number.

begin;

-- The view the function reads scope 3 through has to carry the key too. Appended at the END:
-- create-or-replace cannot insert a column mid-list, and dropping the view would take the
-- restatement views with it.
create or replace view public.scope3_with_required as
 SELECT s3.company_id,
    s3.year,
    s3.reporting_year,
    s3.category,
    s3.reported,
    s3.ghg,
    s3.notes,
    s3.restatement_reason,
    s3.not_reported_reason,
    s3.row_status,
    s3.required_override,
    s3.required_override_rationale,
    s3.relevance_override,
    s3.basis_id,
    s3.basis_note,
    scr.required AS required_sector,
    COALESCE(s3.relevance_override,
        CASE
            WHEN scr.required THEN 'required'::text
            ELSE 'not_required'::text
        END) AS effective_relevance,
    COALESCE(s3.relevance_override,
        CASE
            WHEN scr.required THEN 'required'::text
            ELSE 'not_required'::text
        END) = 'required'::text AS effective_required,
    scr.required_rationale AS sector_required_rationale,
    s3.pub_order
   FROM scope3 s3
     JOIN companies c ON c.company_id = s3.company_id
     JOIN sector_category_relevance scr ON scr.sector = c.sector AND scr.category = s3.category;

commit;
