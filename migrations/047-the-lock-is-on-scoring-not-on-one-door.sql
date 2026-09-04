-- 047: a locked company's published score cannot be moved by ANY caller.
--
-- Felix, 2026-09-04, on seeing H&M's public card change: "how has that got through before I've
-- finished the review for H&M? Doesn't feel like the mechanics are working."
--
-- He is right and it is his own rule from 03-09, broken by the next thing built on top of it.
-- Migration 044 put the lock in `trg_rescore_row`, the trigger on scope12 and scope3. That guards
-- the door the figures come through. `apply-determinations.mjs` does not use that door: it writes
-- the override and then calls `score_company()` directly, so H&M was score_locked = true the whole
-- time, and the published score moved anyway.
--
-- The lock was never about which table was written. It is about whether a published number is
-- allowed to move while a human is still deciding. So it belongs in the one place every path has
-- to go through, and 044's own reasoning for putting the history trigger there rather than inside
-- score_company applies here in reverse: "a trigger catches EVERY path where an edit to one
-- function only catches the callers that go through it." Scoring has exactly one function, and
-- everything goes through it.
--
-- Done as a rename plus a wrapper rather than re-issuing the thousand-line body, because every
-- edit to that body is a risk to published numbers and this change has nothing to do with how a
-- score is calculated.
--
-- unlock_and_score still works: it clears the lock BEFORE it scores, which is the definition of
-- publishing a review.

alter function public.score_company(text) rename to score_company_unlocked;

comment on function public.score_company_unlocked(text) is
  'The scoring calculation itself. Do not call this directly - it ignores the review lock. Call score_company(), or unlock_and_score() to publish a review.';

create or replace function public.score_company(p_company_id text)
returns void
language plpgsql as $$
DECLARE
  v_locked BOOLEAN;
BEGIN
  SELECT score_locked INTO v_locked FROM public.companies WHERE company_id = p_company_id;

  IF COALESCE(v_locked, FALSE) THEN
    -- Deliberately a notice and not an exception. A rescore is a side effect of writing figures,
    -- and raising here would turn "this company is mid-review" into a failed insert on unrelated
    -- data. What must not happen is the published number moving, and it does not.
    RAISE NOTICE 'score_company: % is under review (score_locked), so its published score was left where it is.', p_company_id;
    RETURN;
  END IF;

  PERFORM public.score_company_unlocked(p_company_id);
END;
$$;

comment on function public.score_company(text) is
  'Recompute and publish a company score, unless the company is mid-review. Every path goes through here: the row triggers, the applier scripts, and anything run by hand.';
