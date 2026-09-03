-- 043: a score that changes leaves a record of what it was.
--
-- Felix, 2026-09-03: "We should probably track changes to scores right? So updated score is best."
-- Said while deciding to put the four existing companies back through the review process — which
-- will move their scores.
--
-- `company_scores_public` is one row per company and `score_company()` overwrites it. So every
-- rescore destroys the previous value, and there is no record anywhere of what a company scored
-- before. That is fine while nothing changes and useless the moment anything does: the question
-- "did re-running Chanel change her score, and by how much" becomes unanswerable the second after
-- it happens. History cannot be captured retrospectively, so this has to exist before the re-runs
-- start rather than after.
--
-- A trigger rather than a change to score_company(), for two reasons. score_company() is a
-- thousand lines and every edit to it is a risk to published numbers. And a trigger catches EVERY
-- path — the applier scripts, a manual rescore from psql, a future worker — where an edit to one
-- function only catches the callers that go through it.

create table if not exists score_history (
  id                      bigserial primary key,
  company_id              text        not null,
  changed_at              timestamptz not null default now(),
  -- What it became.
  score_location          numeric,
  score_market            numeric,
  score_status            text,
  unknown_reason          text,
  assessment_year_start   integer,
  assessment_year_end     integer,
  latest_data_year        integer,
  -- What it was immediately before. Held alongside rather than left to be worked out by joining a
  -- row to its predecessor, because the first thing anyone asks is "what changed", and a query
  -- that has to reconstruct that is a query somebody gets wrong.
  prev_score_location     numeric,
  prev_score_market       numeric,
  prev_score_status       text,
  prev_unknown_reason     text,
  -- Why, when the caller bothered to say. Scripts set `thermostat.change_reason` before rescoring;
  -- anything that doesn't leaves it null rather than inventing an explanation.
  reason                  text
);

create index if not exists score_history_company_idx on score_history (company_id, changed_at desc);

comment on table score_history is
  'One row per actual change to a company''s score, status or assessment window. Written by trigger, never by hand. A rescore that changes nothing writes nothing.';

create or replace function record_score_change() returns trigger
language plpgsql as $$
begin
  -- A rescore that lands on the same answer is not a change, and recording it would bury the real
  -- ones. Only a genuine difference in the scored outcome is kept.
  if tg_op = 'UPDATE'
     and new.thermostat_score_location is not distinct from old.thermostat_score_location
     and new.thermostat_score_market   is not distinct from old.thermostat_score_market
     and new.score_status              is not distinct from old.score_status
     and new.unknown_reason            is not distinct from old.unknown_reason
     and new.assessment_year_start     is not distinct from old.assessment_year_start
     and new.assessment_year_end       is not distinct from old.assessment_year_end then
    return new;
  end if;

  insert into score_history (
    company_id, score_location, score_market, score_status, unknown_reason,
    assessment_year_start, assessment_year_end, latest_data_year,
    prev_score_location, prev_score_market, prev_score_status, prev_unknown_reason, reason)
  values (
    new.company_id, new.thermostat_score_location, new.thermostat_score_market,
    new.score_status, new.unknown_reason,
    new.assessment_year_start, new.assessment_year_end, new.latest_data_year,
    case when tg_op = 'UPDATE' then old.thermostat_score_location end,
    case when tg_op = 'UPDATE' then old.thermostat_score_market end,
    case when tg_op = 'UPDATE' then old.score_status end,
    case when tg_op = 'UPDATE' then old.unknown_reason end,
    nullif(current_setting('thermostat.change_reason', true), ''));

  return new;
end;
$$;

drop trigger if exists company_scores_public_history on company_scores_public;
create trigger company_scores_public_history
  after insert or update on company_scores_public
  for each row execute function record_score_change();

-- Today's scores as the baseline, so the first re-run has something to be compared against. Marked
-- as what it is: a starting point, not an observed change.
insert into score_history (
  company_id, score_location, score_market, score_status, unknown_reason,
  assessment_year_start, assessment_year_end, latest_data_year, reason)
select company_id, thermostat_score_location, thermostat_score_market, score_status, unknown_reason,
       assessment_year_start, assessment_year_end, latest_data_year,
       'Baseline recorded when score history was introduced, 2026-09-03. Not an observed change.'
  from company_scores_public
 where not exists (select 1 from score_history h where h.company_id = company_scores_public.company_id);

-- Demo mode renders empty without this, on every new table.
alter table score_history enable row level security;
drop policy if exists "public demo read" on score_history;
create policy "public demo read" on score_history for select to anon using (true);
