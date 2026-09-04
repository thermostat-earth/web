# ThermoStat — build status

_Last updated: 2026-09-02 (see the date note in `HANDOVER-2026-08-28.md` — that session's
documents are stamped 2026-08-28)._

## The restatement methodology

`RESTATEMENT-METHODOLOGY.md` holds the internal rule for judging a restated year. **Steps 1, 2 and
4 are settled, and all six of step 3's scenarios (2026-09-02).** It opens with what the whole thing
is for — we are not verifying emissions, we are making sure a fall in the line means a fall in
emissions.

All six scenarios collapse to one test: **was the change applied to every year in the run.** Applied
throughout, accept; not applied, drop the category if optional and reject the window if required.
Most of it was settled by reading the GHG Protocol rather than by argument — chapter 5 of the
Corporate Standard and section 9.3 of the Scope 3 Standard, quoted in `STANDARDS-AND-RESTATEMENTS.md`.

The database gained three functions behind it: `year_totals_by_publication`, `category_move_check()`
and `move_breakdown()` (migrations 030–032), plus source page numbers on
`restatements_for_review`. All applied and re-queried.

**Judgements now reach scoring (2026-09-02).** A confirmed break is a row in
`reporting_basis_breaks`, and `score_company` derives every year's basis from it via `basis_of()`.
There is no separate apply step that can be skipped, because there is nothing stored that could go
stale. H&M carries the only break we hold: Sellpy, from the 2024 report. Their score is unchanged at
1.5095 — correct, because they restated every year they republished.

Two things fixed on the way there, both of which had never shown because the gate had never fired:
the scoring read each year's basis from its scope 1 and 2 row alone, ignoring scope 3 entirely; and
the reviewer had no verdict meaning "no acceptable explanation", so step 2's consequence could not
be recorded at all.

**The write path runs on the server.** `thermostat-apply-breaks.timer` every fifteen minutes carries
a confirmed break from the ops database into ThermoStat and rescores;
`thermostat-breaks-monitor.timer` hourly asks whether any confirmed decision is still not reaching
the score, and Telegrams Felix if one is stuck. Unit files in `felixep-infra/thermostat/systemd/`.

No new credential exists anywhere for this. Felix, 2026-09-02: *"I don't understand why a key is
needed at all!!!!"* — the two databases are separate Supabase projects, in Ireland and Germany, so a
call between them needs one; but the VPS already holds both, so keeping the writer there means
nothing new is exposed. That is also the most secure of the options that were on the table.

⚠️ **The scrape worker has never existed.** Checked 2026-09-02 against the code and the database
rather than the docs: one commit in the repo's history has ever touched `scrape_status`, and it
added the board that displays it. `scraped_at` is null for all 42 pipeline companies. The blocker
sits earlier than the scraper — **not one of Felix's queued companies has a `source_url`**, so
nothing knows which document to fetch.

⚠️ **Nothing captures new companies.** 17 of 21 pipeline companies have sat unscraped since 18 July
and no scheduled job exists to do it. Inditex — the company this whole problem was found through —
has never been captured, which is why the worked examples all use H&M.

## Where it runs
- **Dev/preview site:** thermostat-eta.vercel.app (`main` → Vercel; Felix's permanent preview). Domain thermostat.earth not pointed yet (soft-launch step).
- **Footer** carries `data-build="<sha>"` (hidden attr) so you can confirm what's live.
- **Deploy flow:** edit in `/tmp/ts-company` → `scp` to VPS `~/thermostat/src` → `npm run build` on VPS → commit on `dev` → `git merge --ff-only dev` to `main` → push. `/tmp` clears between days; re-pull with `scp`.
- **Build log:** `BUILDLOG.md` auto-generates from git history via a `post-commit` hook (`scripts/gen-buildlog.sh`) — can't be forgotten. This STATUS.md is the hand-written summary.
- **Data/scoring:** in Supabase Postgres, trigger-driven (`score_company` fn). Runbook: repo `DATA-PROTOCOLS.md`. DB access from the Mac via `~/.felixep/secrets/supabase-thermostat.env` + `~/.felixep/dbtool`.

## Recently done (2026-07-18 session)
- **Homepage** finished: hero "living temperature scale"; three story sections with custom SVG art (magnifier / emissions-chart-with-pathways / impacts colour matrix); headline reworded off the antithesis; white CTAs; section-2 text aligned to the column; **mobile pass** (hamburger nav under `sm`, tighter mobile spacing, heading-first stacking).
- **/about** restructured: pace→temperature diagram (three colour-coded paces 1.6/2.7/3.9°C); "What makes it different" + "Our principles" now icon rows; comma fix.
- **Company-data QA** (all 4 companies): fixed the public **solo-sector** bug — Microsoft (Tech) and ITV (Media) are the only company in their sector, so "≈ sector average" was meaningless; now hidden + labelled "Only company in this sector so far" across dashboard cards, company thermometer, and the sentence. Cleared ITV's `'test'` restatement value; corrected Microsoft's bogus `last_updated`. Confirmed sources present. `last_updated` is not shown anywhere (freshness = the assessment window already on company pages).
- **DATA-PROTOCOLS.md** added: how scoring works (auto via triggers), add-company / refresh-year / add-sector runbooks, QA checklist, verify queries.

## In progress — data ingestion + review system (design DONE, build started)
Full design in memory `thermostat-ingestion-pipeline-design`. Funnel: AI suggests candidates → Felix curates a pipeline board → AI auto-scrapes + triages → review pool → Felix verifies (spot-checks + scope-3 relevance) → approve → auto-scores. Built on ops.felixep.com, reusing the build-in-public pattern.
- **Milestone 1 (pipeline board) — DONE + reworked 2026-08-03.** The AI runs the board: it suggests candidates, ranks them, scrapes, and moves cards. Felix decides two things, both at Review. Sectors are the columns, stages are the bands, and a stage filter shows everything waiting on him in one place. Queued cards report a scrape status rather than offering a button.
- **Milestone 4 (review page) — DONE 2026-08-03**, ahead of 2 and 3 because it is the screen Felix works in. `/dashboard/pipeline/[id]`: verdict banner with the five scoring gates computed from the staged payload, emissions table, attributed spot checks, scope-3 assessment grid, sources, review log. Worked Inditex example seeded under the DEMO owner only — its figures are invented.
- **Rules page — `/dashboard/pipeline/rules`.** All 15 GHG Protocol activity tests with the standard's verbatim wording, 8 assessment principles, and the sector expectations grid. Read the chapter PDFs with `pdftotext -layout` on the VPS; hand-rolled extraction lost text twice and produced two wrong rules.
- **Sector rules are EXPECTATIONS, not requirements** (2026-08-03). Applicability is settled per company by the GHG Protocol activity test; the sector flag only says where to look. The language is changed; the scoring gate in `score_company` still keys off the sector flag and moves once the assessment is producing determinations.
- **Four-pass relevance assessment — DONE 2026-08-19** (ops branch `thermostat-pipeline`, merged to `dev`). The question "does this category apply to this company?" is answered in four passes, each able to settle it without the next: **1** the GHG Protocol activity test, **2** the scope 1 & 2 consolidation boundary, **3** the company's own stated reason tested against `common_invalid_reasons`, **4** the recommendation. Passes 1-3 are evidence; only 4 is an opinion, and it stays **advisory** — Felix's determination is still the only thing that binds, and the page says so.
  - `business_model` in the scrape payload carries the value chain, what the company sells, and the consolidation approach with a flag for whether the company **stated** it or the AI inferred it. Assessed once, applied to all fifteen categories — passes 1 and 2 turn on facts about the company, not the category.
  - **Every claim in that panel carries its own sources** (2026-08-19, Felix's call). Each fact is `{ text, sources }`; a bare string is still accepted because the payload is model-written, but it renders **"No source given"** in amber and the panel counts the unsourced claims in a banner at the top. An unsourced claim in this panel spreads to all fifteen categories, so it must not be able to hide behind well-formatted prose. Both the empty-array and bare-string paths were tested by stripping sources and re-rendering.
  - Review page: a **Business model & boundary** panel above the grid, then per category the activity test, each pass with its evidence, and the recommendation — collapsed behind a teaser that names *which pass settled it* ("already inside scope 1 & 2", "the activity doesn't happen here").
  - Worked example seeded on the Inditex demo card (`ops-012`), chosen to exercise every pass: Cat 10 settles at pass 1, Cat 8 at pass 2 (leased stores already in scope 1 & 2), Cat 14 needs pass 3, Cat 9 deliberately left `unclear`.
  - `scope3_category_guidance` gained an anon read policy (`ops-013`) — it is GHG Protocol reference data with no owner to scope to, so unconditional read is right there.
  - **Sources are real links, and they are checked** (2026-08-19, Felix's call). The whole reference is one click target — label and page together — and PDF sources deep-link to the page (`#page=112`) so a citation opens where it points rather than at the front of a 300-page document. Page numbers only; section labels like "note 17" are left alone. **`ops/scripts/check-links.mjs`** walks every staged payload plus the guidance table, names the exact JSON path of anything dead, and exits non-zero so it can gate a scrape. It immediately found two links that had already shipped: CDP's `/en/responses` (404, in the original ops-004 seed, five references), and `chapterUrl()` generating `Chapter5.pdf` when GHG Protocol names that one file `Ch5_GHGP_Tech.pdf`. Both fixed (`ops-015`). **A dead source link is worse than no source link** — it reads as evidence until the moment you click it to check something. Run this after every scrape.
- ⚠️ **The scrape worker must never write "required" about a sector** (2026-08-20). Sector rules are
  expectations; only the GHG Protocol activity test settles whether a category applies to the company
  in front of you. Two seeded demo notes still read "Required for Fashion" and were caught by Felix
  reviewing the page — fixed in ops-018, along with a review-log string that said "not required".
  A sentence calling a sector rule a requirement undercuts the four-pass argument three inches
  further down the same page, so the worker's prompt has to say **expected / not expected in this
  sector**, and `scripts/check-links.mjs` is the model for how to catch it: assert on the output,
  don't trust the prompt.
- **Not yet built on top of it:** nothing writes `business_model` or `assessment` for a real company — that is the scrape worker's job, and it doesn't exist yet. The demo card is the only payload carrying an assessment. Also open: an "accept the AI's recommendation" button (today Felix retypes the rationale), and `evaluate()` still ignores `assessment` entirely, which is deliberate — the AI must not be able to clear a gap.
- Then: sector-expectations tab with evidence counts, rule-change review window, **VPS scrape + research worker (the next real blocker)**, re-review of the existing 4, and the apply script that commits into ThermoStat.
- **Parent/child:** brands (e.g. Dior under LVMH) get their own labelled card showing the parent's GROUP score; no separate scraping; coverage counted at parent level only.

## Reporting basis — scoring engine BUILT, input side NOT (2026-08-21)

Plan and reasoning: `REPORTING-BASIS-PLAN.md`. Before/after numbers and every test:
`scripts/score-baseline-2026-08-21.md`. Migrations 001-007 in `migrations/`.

**Built and verified today** — all four companies score exactly what they scored this morning,
checked to every decimal place, and each behaviour proved by rolling a change in and back:

| | |
|---|---|
| `basis_id` + `basis_note` on `scope12` and `scope3` | 001 |
| A scored run may not cross a basis change | 002, restored in 005 |
| Every year totalled on ONE basket, taken from the latest scored year | 003 |
| A basket category with no figure disqualifies the year | 004 |
| Reasons: `basis_change`, `category_not_disclosed` | 002, 005 |
| Relevance is three states — required / optional / not_required | 006 |
| Optional counts only where disclosed in every scored year | 007 |

**NOT built. The engine can enforce a basis break; nothing can create one.**

- **No detection.** Nothing compares a year's two reportings, nothing reads a "change of
  methodology" statement, and there is no confirm/reject step. A break can only be made by hand-
  written SQL. `basis_id` is 1 on every row in the database.
- **No staging.** The ops app knows nothing of `basis_id` or the three relevance states — grep
  returns nothing. So a scrape worker reading a methodology-change note has nowhere to put it.
- **Nothing on screen.** The review page shows none of this.
- **Relevance has no validity range.** Three states exist but a judgement still applies to all
  history, so "category 14 applies from 2024" cannot be expressed.

**Next: step 2 of the plan** (detect and confirm a break), then step 5 (show it). Felix's call on
2026-08-21, and right: building the scraper first would mean it reads a methodology change and has
nowhere to put it.

### Two mistakes worth not repeating

- **Migration 003 silently reverted 002**, because it was built by editing a dump of
  `score_company` taken before 002 was applied. The check was "did any score move", and basis
  gating is inert on today's data — so removing it moved nothing either. **Dump the function fresh
  immediately before editing, and afterwards assert every earlier change is present BY NAME.** The
  query is in the baseline doc.
- **006 and 007 should have been one migration.** Splitting the schema change from the scoring
  change that gives it meaning left ITV's live score wrong (1.4490 instead of 1.4528) for a few
  minutes. Since then, every change is dry-run inside a transaction and rolled back before being
  applied for real.

`REPORTING-BASIS-PLAN.md` — how a temperature score stays honest when a company changes what is
inside its boundary. Awaiting Felix's go.

Short version: most of it already works. Restatements are already separate rows, a category that
stops being reported is already a recorded fact, per-year applicability already exists, and the
scored basket is already fixed to the most recent year's required categories — so a category
appearing or disappearing needs no new machinery. The only real gap is a change *inside* a figure,
like Inditex moving own-store fuel into scope 1, which cannot be added or subtracted from anything.


## Reporting basis — the review workflow now exists (2026-08-27)

Detection, evidence and judgement are built and live. What was a plan on Friday is a working
review by Wednesday evening, with one blocking bug outstanding.

| | |
|---|---|
| `restatements_detected` | every year reported twice with a different figure, ordered by when each document was PUBLISHED (migrations 008, 020) |
| `restatements_for_review` | each candidate with the company's own stated reason and a link that opens the PDF at the page (009, 019) |
| `documents` | a document is a thing in its own right — type, series, publication date, URL, liveness (015, 027) |
| `company_base_years` | the baseline each report declares, and why it moved (011) |
| `capture_gaps` | reports that skip a year inside the block they cover (010, 013) |
| `evidence_health` | one row per company: what is verified, what is not (030) |
| `pub_order` | scoring resolves each year to the most recently PUBLISHED reading, not the highest reporting_year (021-023) |

**Judging happens in the ops app**, not here — `basis_judgements` and `basis_ai_signoff` live in the
ops database, because the ops app reads ThermoStat read-only. Applying a confirmed break to the
scored data is a separate step and is **not built**.

**Only what is contestable is surfaced.** The assistant proposes a verdict against every
restatement; the page shows those with no stated reason, no clear answer, or a basis-change verdict,
and the rest are settled with one sign-off that lapses when a new restatement appears.

⚠️ **230 figures across four companies have never been checked against the document they cite.**
`unverified_figures` measures it. That is not new — it is the state that existed unmeasured.

⚠️ **Three NULL-equality bugs in one day**, all from `category` being null for scope 1: it dropped
every scope 1 candidate out of detection, allowed a scope 1 restatement to be judged twice, and
made the upsert unusable through PostgREST. Fixed for good by storing `category_key`.

## Restatements and H&M — where this stands after 2026-09-03

**Every restatement in the database now carries a reason.** It was 30 without one, out of 40; it is
3, and those 3 are ITV's and need its 2023 report. The cause was not that nobody read the reports:
`restatement_reason` was missing from the scope-3 INSERT in `commit-company.mjs` and present in the
scope-12 one directly above it, so every scope-3 reason ever staged was dropped in transit. The tell
was that every H&M restatement arriving via the 2024 report had a reason and every one via the 2025
report did not.

H&M's 27 were backfilled from H&M's own wording, and its own percentages match what we hold to the
decimal on four separate checks — business travel +46% for 2024 and +126% for 2019 against our +46.2
and +126.1; end-of-life +46% and +38% against our +46.2 and +38.4. **Category 11 is recorded as *not
explained by the company*** rather than left null: it moves in every restated year, by up to 28
percent, and neither the 2025 nor the 2024 report accounts for it. "They never said" and "we never
asked" look identical in a null and only one of them is a finding.

**A commit that moves an already-published figure is now refused unless a reason is recorded**, with
no `--force`. Microsoft is blocked by it on 25 figures, which is the gate working.

**Migration 045: an empty scoring window names its real cause.** H&M would have published as
"unknown — no_scope12_data" while holding five years of scope 1 and 2. The real cause is category 2,
which it reports as N/A in every year, so every year is rejected and the window comes back empty.
`score_company` already had the right logic — the block commented *"name the cause, not the
symptom"* — but it sat after the empty-window early exit, so it fired when a missing category cost
*some* years and never when it cost *all* of them. The worse case was the one it could not reach.

**H&M itself:** figures committed under the lock, published score held at 1.5095, basis break
confirmed, sources all resolving, figures spot-checked. One thing outstanding and it is a judgement,
not a build: the category 2 (capital goods) determination.

## What is next

> **It is not here.** ThermoStat's epics, features and items live in **Product Development**
> on ops.felixep.com, and that is the only source of truth for what is shipped and what is not.
> This file records what *exists* — including the reporting-basis section above, which is a
> statement of what is built and what is not, not a to-do list.
>
> Everything that used to be listed here (the 4°C clamp note, the methodology page work, the
> Track A soft-launch steps) is in the tool, broken into items with a "done when" against each.

## What 2026-09-02 taught, kept because it recurred three times in one day

Three separate defects turned out to be the same thing: **code that was correct and had never run.**

1. The reporting-basis gate had never fired. Every row was basis 1 from the day the column was
   added, and the migration that introduced it was written to be inert and verified inert.
2. `score_company` built each year's basis from its scope 1 and 2 row alone, ignoring scope 3 —
   where scenarios two, three and four of the methodology all live. It had never shown because of 1.
3. A test that "passed" because the break it applied touched no scope 1 and 2 row at all, so there
   was nothing for the check to check.

**A check with nothing to check passes, and looks exactly like one that works.** The practical rule
that came out of it: prove an alarm by making it fire, not by watching it stay quiet. The stuck-break
monitor was tested that way — held a break unapplied on purpose, saw it alert, then cleared it.

## What 2026-09-03 taught, and it is the 2026-09-02 lesson one level up

Yesterday's lesson was *code that was correct and had never run*. Today produced four defects that
were all a variant of it, and the variant is worth naming separately:

> **A step that succeeds and cannot record its success is invisible by construction.**

In all four the work ran, produced the right answer, and the answer went nowhere. Nothing failed,
nothing warned, and every one was found only by going and looking.

1. Restatement reasons were read and staged, and dropped by a missing column in the writer.
2. `score_company` knew the real cause and could not reach the line that says it (migration 045).
3. The Internet Archive fallback reached three Chanel documents, printed them as reachable,
   refreshed `http_status` to 200 — and left `decision = 'unusable'` beside it, so Chanel stayed
   stuck. That fallback was itself a fix for *a guard placed after the gate it was meant to open*.
4. The downstream traceability field was a type and some styling that nothing ever wrote.

The practical consequence: **the joins between steps need checks that fail, not steps that are
individually correct.** Automating a silent join only makes the silence faster.

Corollary, learned twice in ten minutes on the same evening: a check you have only ever seen stay
quiet has not been shown to work. A deploy-wait matched the *previous* deployment and would have
reported the site live before it was; a new alarm printed "nothing to report", which is also exactly
what it prints when broken. Both were only trusted after being made to fire.

## What 2026-09-04 taught, and it is the same lesson a third time

Carrying Felix's H&M capital-goods determination into ThermoStat took four minutes. Finding out why
it had not happened by itself, and fixing what that exposed, took the rest of the morning.

**The decision sat unapplied for nineteen hours.** `apply-determinations.mjs` was written on
2026-09-02, is correct, and had **no timer, no cron line, nothing**. AGENTS.md already names this
exact shape — "a tier-2 check nobody runs is a tier-4 rule wearing a hat" — and it was written about
`check-links.mjs`, not this. The same hole existed twice and only one of them was known about.

Two more defects were sitting behind it, both in the last mile between the score and the reader:

1. **A company we cannot score was still publishing a number.** All four unknown paths in
   `score_company` set `score_status = 'unknown'` and leave `thermostat_score_location` in the row
   beside it. H&M went to unknown and thermostat-eta.vercel.app went on showing 1.51 °C. Fixed as a
   trigger (migration 046) rather than four edits inside the function: four edits fix the four paths
   that exist today and say nothing about the fifth.
2. **Both pages said "Not yet scored"**, which says we have not got round to it. We had assessed six
   years. `unknown_reason` was already written and already correct and reached neither page, because
   neither query selected it.

So the running lesson, now three days deep:

| | Lesson |
|---|---|
| 02-09 | Code that was correct and had never run |
| 03-09 | A step that succeeds and cannot record its success is invisible by construction |
| 04-09 | **A join that nothing invokes is indistinguishable from one that works** |

The third is not a new failure mode, it is where the second one lives. Every one of these was found
by a person going and looking, and none of them by anything we own. What now exists for this one:
`thermostat-apply-determinations.timer` every fifteen minutes, and
`thermostat-determinations-monitor.timer` hourly, which alerts when a decision has been unapplied
for forty-five. **Proved by firing it** — the applied stamp was cleared on purpose, the alarm went
off, and it was restored.

**H&M is now unknown / category_not_disclosed and publishes no number.** That is the honest outcome
rather than a failure: H&M reports capital goods as N/A in every year while its own consolidated
cash flow statement shows SEK 10,679m spent acquiring capital assets, so there is a hole in the
disclosure and we say so instead of scoring around it.

⚠️ **And the applying itself was wrong.** H&M was `score_locked` — mid-review — the entire time,
and the published score moved anyway. Migration 044 put that lock on `trg_rescore_row`, the trigger
on scope12 and scope3, which guards the door figures come through. `apply-determinations.mjs` does
not use that door: it writes the override and calls `score_company()` directly. Felix caught it on
the public card within the hour: *"how has that got through before I've finished the review for
H&M? Doesn't feel like the mechanics are working."*

Migration 047 moves the lock inside `score_company`, which every path has to go through, and the
applier now prints HOLD and waits rather than stamping a decision as delivered. H&M is restored to
the frozen row it was holding. **Caveat: `score_history` does not record the four availability
flags**, so those four were reconstructed rather than restored — worth adding to the history table
before the re-runs in step 9 move any more scores.

**Fixed later the same day:** H&M's company page said every year was "outside the most recent
unbroken run" while the header gave the window as 2022–2024. Both could not be true. The years were
inside the window and excluded because category 2 has no figure, so no year is complete — that was
the fallback text firing for every case it could not otherwise explain. It now names the category,
which points a reader at the part of the disclosure that is missing rather than at data that is
fine. The same fix found the chart rendering as an empty box with the reasons only in `title`
attributes, unreachable on a phone; when nothing is complete the causes are written out under it.

## The chain ran end to end, 2026-09-04

**H&M published without anyone typing a command.** This is what step 8 was for, and it is done.

| | |
|---|---|
| 09:25 | Felix records the capital goods determination on the review page |
| 09:41–09:43 | judges the four category 11 restatements as *not explained* |
| ~10:05 | accepts the flagged category 1 figure, adopting the assistant's written reasoning |
| **10:08** | **presses Approve. Nothing further is typed by anyone.** |
| 10:19:58 | `thermostat-apply-approvals.timer` writes category 2 as `required` on 10 rows while the lock is still on, then `unlock_and_score` |

Score moved `scored · 1.5095` → `unknown (category_not_disclosed)`, and
thermostat-eta.vercel.app now reads **"Not scored — a required Scope 3 category is not disclosed"**.

**That is the honest outcome, not a failure.** H&M reports capital goods as N/A in every year while
its own consolidated cash flow statement shows SEK 10,679m spent acquiring capital assets. An
immateriality argument might have been available; an absence-of-activity one is not, and H&M makes
the second. So the disclosure has a hole and the site says so rather than scoring around it.

Every join that was silent that morning is now automatic and watched by something that fails when
the handover does not happen.

## Build journal (build-in-public)
Ops Supabase `build_log`; daily draft → Telegram → review/approve on ops.felixep.com → publish. ThermoStat commits now auto-flagged `social=true` (backstop) so they reach the pipeline. See memory `bip-pipeline-architecture`.
