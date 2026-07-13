# ThermoStat — build status

_Last updated: 2026-07-13_

## Where it runs
- **Production:** thermostat-eta.vercel.app (`main` → Vercel). Domain thermostat.earth not pointed yet (soft-launch step).
- **Footer** shows `build <sha>` (from `VERCEL_GIT_COMMIT_SHA`) so you can confirm what's actually live.
- **Deploy flow:** edit in `/tmp/ts-company` → `scp` to VPS `~/thermostat` → `npm run build` on VPS → commit on `dev` → `git merge --ff-only dev` to `main` → push. `/tmp` is cleared between days; re-pull from the VPS with `scp`.
- **Self-review before shipping visuals:** headless Chrome screenshot of the live page, then eyeball it. Poll the footer `build <sha>` before telling Felix to refresh (Vercel lag ~30–90s).

## Recently done
- **Thermometer view brought to the cards' standard (2026-07-13):** 1.4/2/3/4 °C scale ticks (large labels); off-scale companies sit clear of the hot end labelled `>4.0°C` (no bridge line); bigger dots + labels; other companies fade on hover; legend removed; tube sized to fit the page and only grows downward past ~9 companies; view is deep-linkable via `/scores?view=thermometer`. No per-company sector marks (deliberate — keeps the overview clean).
- Scores page has **two views**: **Dashboard** (default, cards) and **Thermometer** (one centred tube, companies off both sides). View-aware subtitle.
- **Dashboard cards** fully redesigned + polished: big temperature score; vertical thermometer with `1.4/2/3/4 °C` ticks; gradient company-vs-sector arrow (chunky head, **centred on the circle**, bridged to the tube for off-scale so it never detaches); **key** at top-right aligned with the company name; off-scale dots sit just clear of the tube; 2-col grid.
- Company page: ≈ case reworded to "…'s climate pathway is aligned with their sector's average".
- Terminology locked: always **"climate temperature score"** (never "climate score"); always **tCO₂e**.

## Next — Track A to soft launch
1. **Why?** + **About** page content (About = named-founder framing + funding line).
2. Delete temp preview pages: `/logos`, `/score-layouts`.
3. Phone/tablet responsive pass.
4. **Full legal review** + disclaimers / Terms / corrections.
5. **QA the 4 companies** (random checks vs sources; clear any internal NEEDS REVIEW; fix ITV 2025 dup row, Chanel missing 2024 source, Microsoft 2024 boundary check, Cat-11-materiality-for-fashion question; **Microsoft "≈ sector average" vs off-scale dot** — the `above_max` flag and the score/median disagree, check the data).
6. **Soft launch:** point thermostat.earth (framed "early build, more weekly").

## Post-launch
- Data ingestion + human-QA report system → grow 4 → 15 companies, weekly cadence.
- Socials automation (Instagram + LinkedIn Company Page + X): draft → approve → post → measure → learn; ops "Socials" tool.

## Build journal
- Ops Supabase `build_log` table (env `~/.felixep/secrets/supabase-ops.env`, tool `~/.felixep/dbtool`). `[auto]` = internal marker (social=false); curated entries (social=true) are build-in-public candidates. Daily 09:00 London cron drafts → Telegram → approve → publish.
