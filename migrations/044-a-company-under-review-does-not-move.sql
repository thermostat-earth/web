-- 044: a company under review does not move its published score.
--
-- Felix, 2026-09-03, on being told the pipeline would commit H&M's new figures and rescore:
-- "shouldn't the score only change after the basis questions get reviewed? Why is the score
-- changing before the manual person review?"
--
-- He is right, and the cause is older than the pipeline. There is a trigger on scope12 and scope3
-- that calls score_company() on EVERY insert, update and delete. So the instant a new report's
-- figures land, the published score recomputes — before anyone has judged whether the two
-- publications are even measuring the same thing.
--
-- That is fine when figures arrive one settled year at a time. It is wrong for the case this
-- pipeline creates, where a new report restates every prior year and the basis question is exactly
-- what has to be decided before the numbers mean anything together.
--
-- The obvious alternative — don't commit until it is reviewed — does not work, because the
-- restatement can only be SEEN once both publications' figures are in ThermoStat. The data has to
-- land for the question to be askable. So the lock is on the scoring, not on the data.
--
-- Deliberately at company level and not per row: "this company is mid-review" is one fact, and a
-- half-locked company would be a state nobody could reason about.
alter table companies add column if not exists score_locked        boolean not null default false;
alter table companies add column if not exists score_locked_reason text;
alter table companies add column if not exists score_locked_at     timestamptz;

comment on column companies.score_locked is
  'True while a company is mid-review. Figures can still be written and restatements still detected; the published score simply does not move until the review is finished and the lock lifted.';

create or replace function trg_rescore_row() returns trigger
language plpgsql as $$
DECLARE
  v_id     TEXT;
  v_locked BOOLEAN;
BEGIN
  v_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.company_id ELSE NEW.company_id END;
  IF v_id IS NULL THEN RETURN NULL; END IF;

  SELECT score_locked INTO v_locked FROM companies WHERE company_id = v_id;
  -- Mid-review: the figures land, the restatement becomes visible, and the published score stays
  -- exactly where it was until someone lifts the lock deliberately.
  IF COALESCE(v_locked, FALSE) THEN RETURN NULL; END IF;

  PERFORM score_company(v_id);
  RETURN NULL;
END;
$$;

-- Lifting the lock is the act of publishing, so it rescores on the way out. Doing it here rather
-- than leaving it to the caller means a company cannot be left unlocked and stale.
create or replace function unlock_and_score(p_company_id text, p_reason text default null)
returns text
language plpgsql as $$
DECLARE
  v_before TEXT;
  v_after  TEXT;
BEGIN
  SELECT score_status || ' · ' || COALESCE(thermostat_score_location::text, '—')
    INTO v_before FROM company_scores_public WHERE company_id = p_company_id;

  UPDATE companies
     SET score_locked = FALSE, score_locked_reason = NULL, score_locked_at = NULL
   WHERE company_id = p_company_id;

  PERFORM set_config('thermostat.change_reason',
    COALESCE(p_reason, 'Review finished and the score released.'), TRUE);
  PERFORM score_company(p_company_id);

  SELECT score_status || ' · ' || COALESCE(thermostat_score_location::text, '—')
    INTO v_after FROM company_scores_public WHERE company_id = p_company_id;

  RETURN COALESCE(v_before, 'no score') || '  ->  ' || COALESCE(v_after, 'no score');
END;
$$;

comment on function unlock_and_score is
  'End a review: lift the score lock and recompute. Returns the score before and after, because releasing a review is the moment a published number is allowed to move.';
