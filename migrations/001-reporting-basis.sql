-- 001: give every year a reporting basis.
--
-- Step 1 of REPORTING-BASIS-PLAN.md. Deliberately changes NO behaviour: every
-- existing row defaults to basis 1, nothing reads the column yet, and every
-- company must score exactly what it scored before
-- (scripts/score-baseline-2026-08-21.md).
--
-- WHY A PER-COMPANY COUNTER, NOT A TAXONOMY
-- A score is only ever computed within one company, so one company's basis never
-- needs comparing to another's. There is no vocabulary to standardise and nothing
-- to get wrong. basis_id starts at 1 and increments when a break is confirmed;
-- basis_note is the plain-English explanation for a human, and the scoring must
-- never parse it.
--
-- WHAT A BREAK IS
-- A change that happens INSIDE a figure — a company moving own-store fuel into
-- scope 1, say — so that a year is no longer comparable with the one before it.
-- A category appearing or disappearing is NOT a break: score_company already
-- fixes its basket to the categories required in the most recent year and
-- re-totals earlier years on that basket, which handles it like-for-like.

alter table scope12 add column if not exists basis_id integer not null default 1;
alter table scope12 add column if not exists basis_note text;
alter table scope3  add column if not exists basis_id integer not null default 1;
alter table scope3  add column if not exists basis_note text;

comment on column scope12.basis_id is
  'Reporting basis, counted per company. Years with different basis_id are not comparable and must not share a score. See REPORTING-BASIS-PLAN.md.';
comment on column scope3.basis_id is
  'Reporting basis, counted per company. Years with different basis_id are not comparable and must not share a score. See REPORTING-BASIS-PLAN.md.';

-- The view lists its columns explicitly, so it has to be recreated to carry the
-- new ones. score_company reads the view, not the table.
--
-- Dropped and recreated rather than CREATE OR REPLACE: replace can only append
-- columns at the end, and inserting basis_id before required_sector counts as
-- renaming an existing column. Column order matters here only because the new
-- columns belong with the row's other facts rather than after the derived ones.
drop view if exists scope3_with_required;
create view scope3_with_required as
  select s3.company_id,
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
         s3.basis_id,
         s3.basis_note,
         scr.required AS required_sector,
         coalesce(s3.required_override, scr.required) AS effective_required,
         scr.required_rationale AS sector_required_rationale
    from scope3 s3
    join companies c on c.company_id = s3.company_id
    join sector_category_relevance scr on scr.sector = c.sector and scr.category = s3.category;

-- Prove it: every row on basis 1, and the view carries the column.
select 'scope12' as tbl, basis_id, count(*) from scope12 group by 1,2
union all
select 'scope3', basis_id, count(*) from scope3 group by 1,2
union all
select 'view', basis_id, count(*) from scope3_with_required group by 1,2
order by 1, 2;
