# ThermoStat — build status

_Last updated: 2026-07-18_

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
- **Milestone 1 (pipeline board) — data model DONE:** ops-DB tables `pipeline_sectors` + `pipeline_companies` created + seeded (8 sectors, existing 3 first; 21 companies; `parent_company_id` for brands).
- **RESUME HERE →** build the **board UI** on ops.felixep.com (kanban to view/reorder/approve), modelled on the `tasks` tool; then deploy the ops app.
- Then milestones 2–5: commit foundation (`apply-data-review`), auto scrape+triage, review tool, refresh monitoring.
- **Parent/child:** brands (e.g. Dior under LVMH) get their own labelled card showing the parent's GROUP score; no separate scraping; coverage counted at parent level only.

## Next — Track A to soft launch
1. **Methodology page updates** (new public copy → Felix sign-off): company selection (~50–60% sector revenue), non-disclosers shown as "Unknown", parent/child group scoring, sector-average-needs-2. (Sector-average one is already live.)
2. Responsive pass on the other pages (scores, company, impacts) — homepage done.
3. **Legal review** + disclaimers / Terms / corrections.
4. Finish company QA: clear remaining internal **NEEDS REVIEW** flags (Felix, as reviewer); ITV duplicate FY2024 review row (reconcile during the FY2025 refresh).
5. **FY2025 data refresh** for the 4 companies (all currently through FY2024) — run via the new ingestion system once built.
6. **Soft launch:** point thermostat.earth (framed "early build, more weekly").

## Build journal (build-in-public)
Ops Supabase `build_log`; daily draft → Telegram → review/approve on ops.felixep.com → publish. ThermoStat commits now auto-flagged `social=true` (backstop) so they reach the pipeline. See memory `bip-pipeline-architecture`.
