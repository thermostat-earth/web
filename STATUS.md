# ThermoStat — build status

_Last updated: 2026-08-21_

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

## What is next

> **It is not here.** ThermoStat's epics, features and items live in **Product Development**
> on ops.felixep.com, and that is the only source of truth for what is shipped and what is not.
> This file records what *exists* — including the reporting-basis section above, which is a
> statement of what is built and what is not, not a to-do list.
>
> Everything that used to be listed here (the 4°C clamp note, the methodology page work, the
> Track A soft-launch steps) is in the tool, broken into items with a "done when" against each.

## Build journal (build-in-public)
Ops Supabase `build_log`; daily draft → Telegram → review/approve on ops.felixep.com → publish. ThermoStat commits now auto-flagged `social=true` (backstop) so they reach the pipeline. See memory `bip-pipeline-architecture`.
