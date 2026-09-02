-- 038: carry a confirmed basis change through to the readings.
--
-- Stage 7 of the end-to-end map, and the one place where everything either side was built and
-- nothing joined them. Judgements are recorded in the ops database; every reading in ThermoStat has
-- sat at basis 1 since the column was added, so the gate in score_company has never once fired.
--
-- **The basis belongs to the publication, not to the calendar year.** Recorded as a design
-- constraint on 2026-09-02 before this existed, and it is what makes the rule behave: a company
-- that applies a change to its whole history has every year's winning row coming from the same
-- publication, so every year shares a basis and the run holds. A company that restates only its
-- recent years leaves the earlier years' winning rows in an older publication, on the older basis,
-- and the run breaks exactly there. The methodology falls out of one join rather than needing a
-- rule of its own.
--
-- Stamping by calendar year instead would split a company that did the right thing, which is the
-- failure this function exists to avoid.
--
-- Deliberately a function called by hand. Felix confirms a break in the ops app; nothing here
-- watches for that and applies it on its own, because a wrong basis moves a published number.

create or replace function public.apply_basis_break(
  p_company_id           text,
  p_from_reporting_year  integer,
  p_note                 text
) returns integer
language plpgsql
as $$
declare
  v_new_basis integer;
  v_rows      integer;
begin
  -- One more than whatever the publications before this one are on, so repeated calls for the same
  -- break settle on the same number instead of walking upwards.
  select coalesce(max(basis_id), 1) + 1 into v_new_basis
  from (
    select basis_id from public.scope3
     where company_id = p_company_id and reporting_year < p_from_reporting_year
    union all
    select basis_id from public.scope12
     where company_id = p_company_id and reporting_year < p_from_reporting_year
  ) earlier;

  update public.scope3
     set basis_id = v_new_basis, basis_note = p_note
   where company_id = p_company_id
     and reporting_year >= p_from_reporting_year
     and basis_id is distinct from v_new_basis;
  get diagnostics v_rows = row_count;

  update public.scope12
     set basis_id = v_new_basis, basis_note = p_note
   where company_id = p_company_id
     and reporting_year >= p_from_reporting_year
     and basis_id is distinct from v_new_basis;

  perform public.score_company(p_company_id);
  return v_new_basis;
end;
$$;

comment on function public.apply_basis_break(text, integer, text) is
  'Stamp a confirmed reporting-basis break onto every reading taken from that publication onward, then rescore. The basis follows the publication a figure came from, never the calendar year.';

-- Proven on 2026-09-02, both directions:
--
--   Positive. H&M's confirmed Sellpy break applied from the 2024 report onward. Score unchanged at
--   1.5095032111311140925670, window still 2022-2024 — the correct answer, because H&M restated
--   every year they republished, so all four winning rows come from that publication and share
--   basis 2. A change applied to the whole history must not break the run, and it does not.
--
--   Negative, inside a transaction that was rolled back. A break applied to Microsoft from the 2024
--   publication puts 2024 on basis 2 while 2020-2023 stay on basis 1. score_status went to
--   'unknown' with unknown_reason 'basis_change'. The gate fires.
--
-- ⚠️ And it exposed a limit worth naming rather than leaving to be discovered. score_company reads
-- each year's basis from that year's SCOPE 1 AND 2 row only. A break that shows solely in scope 3 —
-- a reclassification between categories, a category added or dropped, which is what scenarios two,
-- three and four are all about — is stamped by this function and then ignored by the scoring. The
-- first test run against Microsoft from the 2025 publication changed nothing for exactly that
-- reason, and read as a working no-op until the function body was checked.
