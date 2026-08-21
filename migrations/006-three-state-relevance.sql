-- 006: relevance is three states, not two.
--
-- Felix, 2026-08-21: "it's not binary, required or not required — there's
-- required, optional and not required."
--
-- Until now a category either counted or it didn't, and "counts" was one boolean.
-- So "optional, they disclose it, so we count it" had to be written as required.
-- ITV category 15 is exactly that: required_override = true, with a rationale
-- next to it reading "ITV explicitly reports Cat15 and it is confirmed material".
-- The flag and the sentence were making different claims.
--
-- That mattered once a required category with no figure started disqualifying a
-- year: a company that voluntarily disclosed something for four years and then
-- stopped would become unscorable, while one that never disclosed it scores
-- normally. Punishing the more transparent company is the opposite of the point.
--
--   required      applies, and they must disclose it. Missing = a gap, and the
--                 year cannot be scored.
--   optional      applies, not obligatory. Counted only where it is present with
--                 a figure in EVERY year of the run; otherwise it simply leaves
--                 the basket and history is re-totalled without it. No penalty.
--   not_required  does not apply to this company. Never counted, in any year.

alter table scope3 add column if not exists relevance_override text
  check (relevance_override in ('required','optional','not_required'));

comment on column scope3.relevance_override is
  'Per-year relevance for this company: required | optional | not_required. Overrides the sector default. See REPORTING-BASIS-PLAN.md.';

-- Carry the existing boolean overrides across so nothing changes meaning:
-- override=false has always meant "does not apply here".
update scope3 set relevance_override = 'not_required'
 where required_override = false and relevance_override is null;

-- override=true meant "count this", which conflated required with optional.
-- Every instance today is a voluntary disclosure the reviewer chose to count,
-- so it becomes optional rather than required.
update scope3 set relevance_override = 'optional'
 where required_override = true and relevance_override is null;

drop view if exists scope3_with_required;
create view scope3_with_required as
  select s3.company_id, s3.year, s3.reporting_year, s3.category, s3.reported, s3.ghg,
         s3.notes, s3.restatement_reason, s3.not_reported_reason, s3.row_status,
         s3.required_override, s3.required_override_rationale,
         s3.relevance_override, s3.basis_id, s3.basis_note,
         scr.required AS required_sector,
         -- Three states, resolved: the company-level override wins, else the
         -- sector default expressed as required or not_required.
         coalesce(
           s3.relevance_override,
           case when scr.required then 'required' else 'not_required' end
         ) AS effective_relevance,
         -- Kept so nothing that still reads the boolean changes behaviour. It now
         -- means strictly "required", which is what the scoring gate needs.
         coalesce(s3.relevance_override, case when scr.required then 'required' else 'not_required' end) = 'required'
           AS effective_required,
         scr.required_rationale AS sector_required_rationale
    from scope3 s3
    join companies c on c.company_id = s3.company_id
    join sector_category_relevance scr on scr.sector = c.sector and scr.category = s3.category;

select effective_relevance, count(*) from scope3_with_required group by 1 order by 1;
