# Plan — keeping a score honest when a company changes its reporting basis

_Written 2026-08-21. Not built. Felix asked for the plan before any work starts._

## The problem, with the real numbers

Inditex's FY2023 report puts FY2023 scope 1 at **11,512** and its 2018 baseline at **19,172**.
The FY2024 and FY2025 reports put the *same* FY2023 at **49,686** and the *same* 2018 baseline at
**76,136**.

Nothing grew. CSRD reporting brought own-store fuel and refrigerant leaks inside scope 1 and
widened the boundary. Every one of those figures is correctly transcribed from the right page of
the right document — and a chart across them shows a fourfold rise in emissions that never
happened.

Today nothing in the system would stop that. `score_company` has consecutive-year logic and
restatement handling, but the word "basis" appears nowhere in it, and no table has a column for it.

## What already works, and must not be rebuilt

Checked against the live database on 2026-08-21, not assumed:

- **Restatements are already rows, not overwrites.** `scope12` is keyed on
  `(company_id, year, reporting_year)` and `scope3` on `(company_id, year, reporting_year, category)`.
  ITV's FY2022 category 11 is held twice — 254,125 as first reported, 485,171 as restated a year
  later. Nothing is lost and nothing is overwritten.
- **Stopping is a fact, not an absence.** ITV's FY2024 category 11 has a row with `ghg = null` and
  `not_reported_reason = 'not_disclosed'`.
- **Per-year applicability exists.** `scope3.required_override` is keyed per year, so whether a
  category counts can already vary across a company's history.
- **The scored basket is already like-for-like.** `v_required_cats` is taken from the **most recent
  year**, and a year only qualifies if it contains that whole basket. So if the newest year requires
  fewer categories, earlier years are re-totalled on the smaller set rather than compared against a
  larger one. Optional disclosures are shown but never summed.
- **Staleness is already handled.** A run only counts if its last year is within two calendar years
  of the assessment date; otherwise the company is unscored with reason `data_too_old`.

**The consequence: a category appearing or disappearing needs no new machinery at all.** The basket
rule handles it. That is most of what looked like a big job.

## What is missing

Only one thing, and it is narrow: **a change that happens *inside* a figure.**

Own-store fuel moving into scope 1 is not a category that can be added or subtracted. It is not
disclosed separately in the new year, and it was never measured in the old ones. There is nothing to
reconcile, so the like-for-like trick cannot reach it.

## The plan

### 1. Basis is a per-company counter, not a taxonomy

A score is only ever computed within one company, so Inditex's basis never needs comparing to ITV's.
No vocabulary to standardise and nothing to get wrong.

- `basis_id` (integer) on `scope12` and `scope3`, and on `StagedYear` in the pipeline payload.
- Starts at 1 and increments when a break is confirmed.
- A plain-English note explaining the break sits alongside for a human to read. **The scoring never
  parses it.**

Backfill: Inditex FY2018 and FY2023–25 are basis 2; FY2019–FY2022 are basis 1. The other three
companies have no known break, so everything is basis 1.

### 2. Breaks are proposed by the system, confirmed by Felix

Two signals, and neither one decides:

- **Numeric.** The same year reported twice with a materially different figure. Already computable —
  both readings are in the database. Inditex FY2023 scope 1 moved 331%.
- **Stated.** The company says it changed methodology. Inditex's report has a literal
  "change of criterion/methodology" column. A text signal the scrape worker reads.

**Detection cannot be the decision.** ITV's FY2022 category 11 was restated by 91% with no basis
change — a better calculation, not a boundary move. A numeric trigger alone would flag ITV wrongly.
So the system says "these years may not be comparable, here is the evidence" and Felix decides,
exactly like a relevance determination.

Expected volume: **zero or one break in most companies' entire history.** This is not an annual
chore.

### 3. The score spans the most recent *complete* run, not necessarily the newest year

If a company restates only the current year, the new basis has one year and the old run still has
three. Rather than refusing to score:

- Score the most recent run that has enough consecutive years **within one basis**.
- Say so on the page: "scored FY2020–FY2022; FY2023 onward is on a new basis with only one year
  available."

This is not indefinite, and the existing staleness rule is what limits it. The old run's last year
must be within two years of today, so a company that never restates its history becomes unscorable
on its own — with `data_too_old` as the honest reason rather than anything about basis.

Inditex gets no grace under this and does not need it: its old-basis years stop at FY2022, already
outside the window, and its new basis has three consecutive years ending FY2025.

### 4. Relevance gets a validity range, not a year

The four-pass assessment currently has no year, so one judgement is applied to all history.
Assessing 15 categories × 7 years per company is unworkable and mostly meaningless — relevance
changes when something happens, not annually.

So: an assessment carries `applies_from` (and optionally `applies_to`), and is only revisited when a
break is confirmed or a category's reported status changes. That populates the per-year
`required_override` the database already supports.

### 5. Say it on screen

- The emissions table marks where the basis changes.
- The verdict names which years were scored, which were excluded, and why.
- The review page and the public score use the **same rule**, so they cannot disagree — the failure
  found on 2026-08-21, where a company card and its review page stated different figures.

## Order, and why

1. **Basis column + backfill** — half a day. Nothing changes behaviour yet.
2. **Scoring gates on basis** — half a day, and the careful one: this function produces the public
   number.
3. **Screen changes** — small.
4. **Relevance validity range** — a day, touches the review page. Last because today a single
   assessment is not *wrong* for any company we hold, just not general.

## Risks worth naming before starting

- **Changing `score_company` changes public scores.** Capture what all four companies score today
  before touching it, so any movement is visible and explained rather than discovered later.
- **A wrongly-confirmed break is expensive**: it splits a history and can drop a company below the
  three-year threshold. It should be as easy to undo as to make.
- **Sequential basis ids assume breaks are found in order.** Reading an old report after a new one
  could discover an earlier break. Assign ids by year order, not discovery order.
