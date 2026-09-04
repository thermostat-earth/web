-- 046: a company that is not scored publishes no number.
--
-- Found on 2026-09-04, one minute after carrying Felix's H&M capital-goods
-- determination into ThermoStat. score_company correctly moved H&M to
-- score_status = 'unknown' / 'category_not_disclosed' — and thermostat-eta.vercel.app
-- went on showing H&M at 1.51 °C, because every unknown path in score_company writes
-- the status and leaves the previously published score sitting in the row beside it.
--
--   INSERT ... ON CONFLICT DO UPDATE
--     SET score_status = 'unknown', unknown_reason = ..., last_updated = NOW();
--          ^ four separate paths, none of them clears thermostat_score_*.
--
-- The public site never had a chance: ScoreCard already renders "Not yet scored"
-- when the score is null, and ScoresView already filters the thermometer on the same
-- test. Both were being handed a number. The bug is in the data, not the page.
--
-- Why a trigger rather than four edits inside a thousand-line function: the four
-- edits fix the four paths that exist today and say nothing about the fifth. A
-- constraint on the table makes the bad state unreachable however it is written —
-- by score_company, by a migration, by a hand-run UPDATE at 2am. This is the same
-- reasoning as the no-commit-on-main hook: the wrong thing stops being available
-- rather than being remembered against.
--
-- Note what it deliberately does NOT clear: assessment_year_start/end (the window we
-- looked at is still true), unknown_reason, and the sector medians (context about
-- other companies, not a claim about this one).

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
  end if;
  return new;
end;
$$;

drop trigger if exists trg_unscored_publishes_no_number on public.company_scores_public;

create trigger trg_unscored_publishes_no_number
  before insert or update on public.company_scores_public
  for each row execute function public.enforce_unscored_publishes_no_number();

-- Fix the rows that are wrong right now. Today that is H&M and nothing else, but the
-- statement is written for whatever is there rather than for H&M by name.
update public.company_scores_public
   set last_updated = now()
 where score_status is distinct from 'scored'
   and (thermostat_score_location is not null or thermostat_score_market is not null);
