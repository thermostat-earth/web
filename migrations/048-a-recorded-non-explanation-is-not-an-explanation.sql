-- 048: "the company did not explain this" is a finding, not an explanation.
--
-- Felix, 2026-09-04: "I just clicked 'change decision' on cat 11 and it disappeared."
--
-- It did, and the disappearance was the visible end of a data problem. On the morning of 2026-09-04
-- H&M's 31 restatements were backfilled with reasons, and the four category 11 rows — the ones the
-- company accounts for nowhere — were deliberately recorded as
-- "NOT EXPLAINED BY THE COMPANY. Category 11 moves in every restated year...".
-- Recording that rather than leaving it null was the right call. Putting it in the field that means
-- "what the company said" was not.
--
-- Everything downstream tests that field for emptiness:
--
--   · evidence_health.restatements_unexplained counts `company_stated_reason IS NULL`. H&M's
--     unexplained count read 0 while four restatements were unexplained, which is the exact figure
--     a reviewer would use to decide there was nothing to look at.
--   · The review page surfaces a restatement for decision when the company gave no reason. A
--     non-empty string is a reason, so all four silently left the list — and category 11 is the
--     largest scope 3 category H&M has after purchased goods, moving up to 28% a year with no
--     account given anywhere. The one that most needed a human was the one removed from view.
--
-- So: the rule for "did the company actually explain this" gets one home, in the database, and the
-- app reads a boolean instead of re-deriving it from a string. A convention enforced by every
-- reader agreeing to parse the same prefix is not enforced at all.

create or replace function public.is_company_explanation(p_reason text)
returns boolean language sql immutable as $$
  -- Null, blank, or one of our own recorded non-explanations. The marker is matched
  -- case-insensitively and anchored, so a company sentence that happens to contain the words
  -- cannot be mistaken for the marker.
  select p_reason is not null
     and btrim(p_reason) <> ''
     and upper(btrim(p_reason)) not like 'NOT EXPLAINED BY THE COMPANY%';
$$;

comment on function public.is_company_explanation(text) is
  'Whether a restatement_reason is the COMPANY explaining itself, as opposed to null or our own recorded finding that it did not. The single home of that rule — do not re-derive it by string matching in an app.';
