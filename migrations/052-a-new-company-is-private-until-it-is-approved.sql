-- 052 — a new company is private until it is approved
--
-- Felix, 2026-09-05: "we need to be able to add the company to the review stage without putting
-- them to the public scores page until the review is done."
--
-- The mechanism for this already existed and nothing was using it. The public site reads exactly
-- one table, company_scores_public, and that table is only ever written by score_company_unlocked.
-- score_company() is a no-op while companies.score_locked is true. So a company that is locked from
-- the moment it is created never reaches the public page, and is released by the ordinary approval
-- path — apply-approvals.mjs calling unlock_and_score() when Felix clicks Approved.
--
-- Proved before writing this, not assumed: inserting a locked company and calling score_company on
-- it produced zero rows in company_scores_public and left the published count at four.
--
-- What was missing was only the default. score_locked defaulted to FALSE, so the seventeen
-- companies about to be created by the new register step would each have had to remember to lock
-- themselves, and a company that forgets is a company published unreviewed. Flipping the default
-- makes forgetting impossible rather than discouraged — the wrong thing cannot be expressed by
-- omission. Releasing a score stays a deliberate act, which is what it should always have been.
--
-- Existing rows are untouched: the four published companies stay published.

ALTER TABLE public.companies
  ALTER COLUMN score_locked SET DEFAULT TRUE;

ALTER TABLE public.companies
  ALTER COLUMN score_locked_reason SET DEFAULT 'new company — not yet reviewed';

COMMENT ON COLUMN public.companies.score_locked IS
  'TRUE means this company publishes no score: score_company() returns without touching '
  'company_scores_public, which is the only table the public site reads. Defaults to TRUE so a '
  'newly added company is private until someone deliberately releases it via unlock_and_score(). '
  'Set FALSE only by apply-approvals.mjs, when Felix marks the company Approved.';
