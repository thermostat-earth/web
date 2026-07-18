# ThermoStat — build status

_Last updated: 2026-07-18_

## Where it runs
- **Production / dev site:** thermostat-eta.vercel.app (`main` → Vercel). This is Felix's permanent dev/preview URL. Domain thermostat.earth not pointed yet (soft-launch step).
- **Footer** carries `data-build="<sha>"` (hidden HTML attribute, from `VERCEL_GIT_COMMIT_SHA`) so you can confirm what's actually live without a visible build string on the page.
- **Deploy flow:** edit in `/tmp/ts-company` → `scp` to VPS `~/thermostat/src` → `npm run build` on VPS → commit on `dev` → `git merge --ff-only dev` to `main` → push. `/tmp` is cleared between days; re-pull from the VPS with `scp`.
- **Build log:** `BUILDLOG.md` is auto-generated from git history by a `post-commit` hook (`scripts/gen-buildlog.sh`) on every commit, so it can never be forgotten or drift. This STATUS.md is the hand-written human summary.
- **Verify before refresh:** poll the live footer `data-build` for the new sha before telling Felix to refresh (Vercel lag ~30–90s). No headless-Chrome screenshots for routine deploys.

## Recently done
- **Homepage redesign (2026-07-18):** dark-mode-only. Hero is a "living temperature scale" (`HeroScale`) — a horizontal green→red gradient bar with the scored companies pinned along it, a 1.4/2/3/4°C ruler, hover dims the others and shows a "Go to score →" popup; dots/labels link to each company page. Below the hero, three alternating story sections: (1) **What ThermoStat is for**, (2) **How a company becomes a temperature**, (3) **What the number means**. Section dividers removed. Bottom disclaimer says "ThermoStat scores" (not "ranks").
- **Three custom section illustrations (`HomeArt.tsx`, 2026-07-18):** minimalist SVG line-drawings matched to the dark theme.
  - *MagnifyArt* — a magnifier over messy overlapping reports, one clean colour-coded reading in the lens ("What ThermoStat is for").
  - *NumberArt* — a company's glowing white emission columns with dotted temperature pathways (1.5°C green / 3°C orange / 4°C red) curving over the top, labelled mid-line ("How a company becomes a temperature"); chart left-aligned to the text.
  - *ImpactsArt* — a compact 4×4 matrix summarising the Impacts page: temperatures across the top (1.5→4°C, green→red), metrics down the side (Heatwaves/Floods/Economy/Harvests), each cell a short value from that page in a temperature-tinted tile ("What the number means").
- **/impacts page (2026-07-13/14):** four metric cards (Heatwaves / Flooding / Economy / Harvests), each with a 4-band (1.5/2/3/4°C) value row, a "what this means for you" note, and hyperlinked verified sources (links checked to 200; OECD left unlinked as bot-blocked). Linked from the homepage.
- **Why? + About consolidated into one /about page (2026-07-13):** mission, the problem, what we do, what makes it different, principles, and "who's behind it" (founder Felix Edge-Partington + funding line). Copy went through Felix line-by-line. "What the temperature refers to" explainer on /about and /methodology. Nav: **Scores · About · Methodology**; old `/why` 307-redirects to `/about`.
- **Thermometer view brought to the cards' standard (2026-07-13):** 1.4/2/3/4°C scale ticks; off-scale companies sit clear of the hot end labelled `>4.0°C`; bigger dots + labels; others fade on hover; deep-linkable via `/scores?view=thermometer`.
- Scores page has **two views**: Dashboard (cards, default) and Thermometer.
- Terminology locked: always **"climate temperature score"** (never "climate score"); always **tCO₂e**.

## Next — Track A to soft launch
1. Delete temp preview pages still in the build: `/logos`, `/why` redirect aside, any `/score-layouts`.
2. Phone/tablet responsive pass (incl. the new homepage hero + section images).
3. **Full legal review** + disclaimers / Terms / corrections.
4. **QA the 4 companies** (random checks vs sources; ITV 2025 dup row, Chanel missing 2024 source, Microsoft 2024 boundary check, Cat-11-materiality-for-fashion; **Microsoft "≈ sector average" vs off-scale dot** — the `above_max` flag and the score/median disagree, check the data).
5. **Soft launch:** point thermostat.earth (framed "early build, more weekly").

## Post-launch
- Data ingestion + human-QA report system → grow 4 → 15 companies, weekly cadence.
- Socials automation (Instagram + LinkedIn Company Page + X): draft → approve → post → measure → learn; ops "Socials" tool.

## Build journal (build-in-public)
- Ops Supabase `build_log` table (env `~/.felixep/secrets/supabase-ops.env`, tool `~/.felixep/dbtool`). `[auto]` = internal marker (social=false); curated entries (social=true) are build-in-public candidates. Daily 09:00 London cron drafts → Telegram → approve → publish. Separate from the code `BUILDLOG.md` above.
