-- 050: a company that is not scored has no assessment window.
--
-- Felix, 2026-09-04: "why does this say 2020-2024 - don't we have 2025 numbers?"
--
-- We did and we do: Microsoft's FY2025 figures are committed, and the release preview computed the
-- window as 2020-2025. What he was looking at was 2020-2024 left over from a hand-repair earlier
-- that afternoon, still sitting in the row after the company went to unknown, because none of the
-- unknown paths in score_company touch the window fields.
--
-- Migration 046 already made this argument about the SCORE: a company we cannot score must not
-- publish a number. The window is the same claim in smaller print — "these are the years we
-- assessed" — and when nothing was scored, no years were assessed. Leaving the last value there
-- makes a stale field look current, which is the failure this whole week has been about.
--
-- Extending the existing trigger rather than adding a second one: one function owns the invariant
-- "an unscored row publishes nothing", and the next person changing it has one place to look.

create or replace function public.enforce_unscored_publishes_no_number()
returns trigger language plpgsql as $$
begin
  if new.score_status is distinct from 'scored' then
    new.thermostat_score_location  := null;
    new.thermostat_score_market    := null;
    new.fit_error_location         := null;
    new.fit_error_market           := null;
    new.score_location_available   := false;
    new.score_market_available     := false;
    new.score_above_max_location   := false;
    new.score_above_max_market     := false;
    new.score_below_min_location   := false;
    new.score_below_min_market     := false;
    -- Added 2026-09-04. No score means no assessed years; the window described a scoring run that
    -- did not happen. unknown_reason still says WHY, which is the part a reader needs.
    new.assessment_year_start      := null;
    new.assessment_year_end        := null;
  end if;
  return new;
end;
$$;

-- Clear the rows that are wrong right now. Today that is Microsoft and H&M.
update public.company_scores_public
   set last_updated = now()
 where score_status is distinct from 'scored'
   and (assessment_year_start is not null or assessment_year_end is not null);

select company_id, score_status, unknown_reason, assessment_year_start, assessment_year_end
  from public.company_scores_public order by company_name;
