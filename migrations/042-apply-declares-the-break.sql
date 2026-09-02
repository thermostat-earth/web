-- 042: apply_basis_break declares the break instead of stamping every row.
--
-- Finishes the swap. 040 made the break a row, 041 made the scoring derive from it, and this leaves
-- one way for a break to come into existence. Stamping basis_id row by row would now be a second
-- source of truth that the scoring no longer reads — the exact shape of bug this whole option was
-- chosen to remove.
--
-- The function keeps its name and signature because the VPS applier calls it, and renaming it in
-- the same change that alters its behaviour would make a failure ambiguous between the two.
--
-- basis_id is still written, for now, so the rows and the derived answer stay in step and either
-- can be checked against the other. Nothing reads it.

create or replace function public.apply_basis_break(
  p_company_id           text,
  p_from_reporting_year  integer,
  p_note                 text
) returns integer
language plpgsql
as $$
declare
  v_basis integer;
begin
  insert into public.reporting_basis_breaks (company_id, from_reporting_year, note, source)
  values (p_company_id, p_from_reporting_year, p_note, 'ops review')
  on conflict (company_id, from_reporting_year)
    do update set note = excluded.note, confirmed_at = now();

  v_basis := public.basis_of(p_company_id, p_from_reporting_year);

  -- Kept in step with the derived answer rather than consulted. See the note above.
  update public.scope3
     set basis_id = public.basis_of(p_company_id, reporting_year), basis_note = p_note
   where company_id = p_company_id;
  update public.scope12
     set basis_id = public.basis_of(p_company_id, reporting_year), basis_note = p_note
   where company_id = p_company_id;

  perform public.score_company(p_company_id);
  return v_basis;
end;
$$;

comment on function public.apply_basis_break(text, integer, text) is
  'Declare a confirmed reporting-basis break and rescore. The break is a row in reporting_basis_breaks; the scoring derives every basis from it, so there is no separate step that can be skipped.';

-- Verified 2026-09-02, all inside transactions that were rolled back except the first:
--
--   1. All four scores rescored on the derived basis and came back identical, H&M still
--      1.5095032111311140925670. The seeded break derives exactly the basis that was stamped on
--      their rows earlier, so the swap is provably inert rather than assumed to be.
--   2. A break declared as a row alone, stamping nothing — all 135 Microsoft readings left on
--      basis_id 1 — and the score still refused with 'basis_change'. That is the whole point: the
--      score is now a function of the confirmed breaks, not of a column somebody remembered to set.
--   3. apply_basis_break end to end on the new path: returns basis 2, the score refuses, the break
--      table holds the row.
