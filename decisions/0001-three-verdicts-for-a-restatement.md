# 0001 — A restatement gets three verdicts, not two

- **Decided:** 2026-08-28
- **By:** Felix
- **Status:** agreed, built, live
- **Touches:** restatement methodology, scoring

## The question

A restatement was judged one of two ways: the company changed what it counts (a basis break, which
stops a score spanning it), or it just measured better (same basis, nothing changes). Is that
enough?

## What prompted it

Felix, reviewing H&M: an activity can move from one scope 3 category into another, or out of scope 3
into scope 1 and 2. Both lines move. The company's total for that year does not. Calling that a
basis break stops a run for no reason, because the thing the score is computed on — a basket total —
has not changed at all.

## Options considered

1. **Leave it at two.** Judge a move as "better calculation" and move on. Rejected: it is not a
   better calculation, and the record would say something untrue about why the years still compare.
2. **Leave it at two, treat a move as a break.** Rejected: it stops runs unnecessarily, and a
   company that tidies its own reporting would be punished for it.
3. **Add a third verdict.** Chosen.

## The decision

A third verdict: **they moved it between categories, the total is the same.** Same basis, years stay
comparable.

It carries a condition that the other two do not: it only holds if **both sides stay inside what is
counted.** An activity moved out of the basket into a category that is not scored is a real drop and
must still break the run — otherwise a company can reclassify its way to a better score.

## Why this and not the alternatives

The other two verdicts rest on what the company *said*. This one rests on what the numbers *do*,
which means it can be tested rather than trusted — and it is the only one of the three where that is
possible. That makes it stronger than the alternatives, not weaker, provided the test is real.

## What would change our mind

If the test turns out to be unusable in practice — if most claimed moves cannot be verified because
one side was never disclosed — then a verdict that can only be taken on trust is no better than
option 1, and it should be merged back into "better calculation" with a note. See 0003, which is the
open question about exactly that.

## Where it lives

`basis_judgements.verdict = 'category_move'` in the ops database (migration `basis-004`), offered on
both places a restatement is judged in the ops app.
