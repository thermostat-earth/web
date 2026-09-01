# Restatement methodology

> **Status: steps 1 and 2 are settled. Step 3 is being worked through scenario by scenario.**
> Written 2026-08-28 with Felix, from the H&M worked example. This is the internal rule; the
> public wording for thermostat.earth is a separate job and needs his sign-off.

## What we are for

We are not verifying anybody's emissions. We are making sure that **a fall in the line means a
fall in emissions** — that what we publish represents true decarbonisation rather than a change
in how the counting was done.

Every rule below follows from that one sentence. When a rule is hard to settle, the question to
ask is not "is this figure right" but *"would including this year alongside the others make a
change in reporting look like a change in emissions?"*

## The test, in order

### 1. Has the year's emissions changed for any category?

We hold every publication of every year as its own row — a restatement is never an overwrite. So
this is answered by comparing publications, not by reading anything.

A year has been restated if any category, or scope 1 and 2, carries a different figure in a later
publication than in an earlier one.

If nothing changed, there is nothing to judge and the year is used as published.

### 2. Is there an explanation for the change?

**Every restated figure needs the company to have said how the methodology changed.** Not a
general statement that figures were updated — an explanation that reaches the year and the
category in front of us.

- **Explained** → go to step 3.
- **Not explained** → the figure is not accepted. If the category is **not required** for this
  company, it is excluded from the scoring boundary — dropped from *every* year of the run, so the
  history is re-totalled without it and the trend is undistorted. If the category **is required**,
  the year fails.

Deliberately strict, for a reason Felix gave on 2026-08-28: being strict here rewards companies
that explain themselves and creates pressure toward better practice. A company that restates a
figure by 28% without a word loses the credit for that disclosure — it is not accused of anything,
it simply stops counting until it is explained.

⚠️ **Required is not a sector rule.** Whether a category is required for a company comes from the
GHG Protocol together with the business-model and value-chain review of that company. The sector
table is an expectation used as context, never the decision. Where no determination has been made
for a company, step 2's consequence cannot be settled — the determination has to be made first.

### Where this sits in the review

Settled 2026-08-28. The business-model and value-chain review comes **first**, and it is done
**per year**: what the GHG Protocol requires of this company, for that year, given what the company
actually did that year. Restatements are judged after it, because step 2's consequence — exclude if
optional, fail if required — cannot be evaluated without knowing which categories were required in
the year being judged.

**Which comes first resolves once relevance carries a validity range**, which is already the design
in `REPORTING-BASIS-PLAN.md` section 4 and is not built yet. A determination is made **once**, dated
from a year, and holds forward until something happens that could invalidate it. It is not remade
annually — relevance changes when the business changes, not when the calendar does.

That makes the order a sequence rather than a loop:

1. One business-model and value-chain determination, dated from the earliest year in the run.
2. It holds forward, populating the per-year applicability the database already supports.
3. A confirmed boundary-changing restatement is **the event that ends one range and opens the
   next** — it is the trigger to revisit the determination, not a competitor to it.

So restatements inform the review without depending on it. Felix, 2026-08-28: the review must not
mean answering the same questions for every year when nothing changed.

For H&M that means one determination covering 2019 onward, and the Sellpy restatement raising
exactly one question — did the group change in 2022 such that the determination no longer holds —
rather than a per-year grind across fifteen categories and four years.

**What re-opens a determination** (Felix, 2026-08-28). Holding forward is only safe if something
watches for the business changing. Two triggers, and both are needed:

- **External checks.** Acquisitions, disposals, restructures — things that change what the company
  is, which will not always appear in an emissions note. Watched independently of the reports.
- **Methodology statements in the emissions sections of reports.** A company saying it has changed
  what it counts is the company telling us the determination may be stale. Read from the report at
  capture, not inferred from the numbers.

Either trigger re-opens the determination from the year it applies. Neither is built.

### 3. Do we accept the reason?

**Being worked through scenario by scenario. Not settled.**

The framing agreed so far: we are not judging whether the reason is *true*. We take the company at
their word about what they did. We are judging **which kind of change it was**, because the kinds
have different consequences for comparability.

The scenarios still to be decided, one at a time:

- Better measurement of the same things — factors, actuals replacing estimates, errors corrected
- The boundary moved — acquisition, divestment, a subsidiary consolidated, a standard widening scope
- Reclassified between categories with nothing entering or leaving
- A change in what the company chooses to disclose
- A reason given that does not reach the year or category it is attached to
- A reason too vague to place in any of the above

### 4. Was it applied to every year in the run?

Settled 2026-08-28. **Work backwards from the most recent year and check each earlier year is
consistent with it.** The newest publication is the company's current position, so it is the
reference; a run holds only as far back as the years that share it.

This matches how the score already behaves — the scored basket is taken from the most recent year
and every earlier year must contain it — so the two rules point the same way rather than fighting.

## The worked example: H&M

Eight restatements across 2022 and 2023, from the 2024 Annual and Sustainability Report.

**Step 1** — all eight changed. Confirmed by comparing the 2022 and 2023 disclosures against the
2024 report.

**Step 2** — seven carry an explanation. One does not: **2022 category 11, use of sold products,
1,442,000 → 1,851,000 tCO₂e, +28.4%.** Checked against the document itself rather than our
database: the report's emissions note, its improved-data-quality section on page 66, and its
target footnote all say nothing about it.

Across all four companies we hold, that is the **only** restatement of seventeen with no stated
reason. Strictness here is affordable.

**The page 66 question, resolved 2026-08-28 by reading the page.** The section does open by saying
it covers *"specifically 2023 figures and baseline 2019 figures"*, and it quantifies only those two.
But it closes with:

> "For our full scope 3 emissions, including the use-phase all these changes corresponds to a
> decrease of 1 percent or 119,159 tonnes CO2e for 2023 and a 2 percent or 275,732 tonnes CO2e
> increase for 2019 […] **All these changes have been applied to historical results.**"

That is a statement, not an implication: the changes were applied across the history, which reaches
2022. So the explanation does cover the years it is attached to, and **H&M stays at one failure
rather than three.**

The rule this settles: an explanation reaches a year if the company **says** it was applied to that
year, whether or not the effect on that year is quantified. Quantifying every year is better
practice; not quantifying it is not a failure to explain.

**Step 2 consequence** — cannot be settled yet. Category 11 for H&M has no business-model
determination; it is falling through to the Fashion sector expectation, which is context and not a
rule. That determination has to be made before the consequence is known.
