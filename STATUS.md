# ThermoStat — build status

_Last updated: 2026-08-18_

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
- **RESUME HERE →** the four-pass relevance assessment: a business-model / value-chain pass (including the scope 1 & 2 consolidation boundary) in the scrape payload, then surface the evidence and the AI's recommendation per category on the review page.
- Then: sector-expectations tab with evidence counts, rule-change review window, VPS scrape + research worker, re-review of the existing 4, and the apply script that commits into ThermoStat.
- **Parent/child:** brands (e.g. Dior under LVMH) get their own labelled card showing the parent's GROUP score; no separate scraping; coverage counted at parent level only.

## Next — Track A to soft launch
1. **Methodology page updates** (new public copy → Felix sign-off): company selection (~50–60% sector revenue), non-disclosers shown as "Unknown", parent/child group scoring, sector-average-needs-2. (Sector-average one is already live.)
2. Responsive pass on the other pages (scores, company, impacts) — homepage done.
3. **Legal review** + disclaimers / Terms / corrections.
4. Finish company QA: clear remaining internal **NEEDS REVIEW** flags (Felix, as reviewer); ITV duplicate FY2024 review row (reconcile during the FY2025 refresh).
5. **FY2025 data refresh** for the 4 companies (all currently through FY2024) — run via the new ingestion system once built.
6. **Soft launch:** point thermostat.earth (framed "early build, more weekly").

> **Launch blocker found 2026-08-03 — and it happened again on 2026-08-18.** The Supabase project
> pauses after about a week idle and takes the public site down with it. On 18 August the database
> hostname stopped resolving entirely (NXDOMAIN from two networks) and **thermostat-eta.vercel.app
> returned HTTP 500 on every page**. Nobody noticed; it was found by accident while answering an
> unrelated question. Felix restored it from the Supabase dashboard the same evening and everything
> came back intact — all 9 tables, 4 companies still `scored`, `last_updated` stamps still reading
> March–July, which is the proof it was a genuine restore and not a blank re-init.
>
> Nightly scraping will not prevent this, because that writes to the ops database, not ThermoStat's.
>
> - ✅ **The uptime check now exists.** `felixep-infra/bot/site-monitor.mjs` runs every 15 minutes and
>   Telegrams Felix when a site breaks. It checks `/scores` for a **company name**, not just a 200,
>   so it fails if the database disappears even while the site still renders.
> - ⬜ **Still open: the pause itself.** Before thermostat.earth is pointed at this, it needs a paid
>   plan or a keep-alive. The monitor tells you it broke; it doesn't stop it breaking.


## Build journal (build-in-public)
Ops Supabase `build_log`; daily draft → Telegram → review/approve on ops.felixep.com → publish. ThermoStat commits now auto-flagged `social=true` (backstop) so they reach the pipeline. See memory `bip-pipeline-architecture`.
