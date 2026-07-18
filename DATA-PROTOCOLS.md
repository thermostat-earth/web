# ThermoStat — data protocols

How to **add a new company** and **refresh a company's data** to a new reporting
year, and the QA around both. Written from the live schema and the `score_company`
function (2026-07-18).

---

## 0. How scoring works (read this first)

Scores are **not** computed by any app or script. They are computed **inside the
database** by the `score_company(company_id)` function, and that function runs
**automatically** via triggers whenever you change any of these tables:

- `companies`
- `scope12`  (scope 1 & 2 emissions, per data year)
- `scope3`   (scope 3 emissions, per data year × category)
- `sector_category_relevance`  (which scope-3 categories are material per sector)

So the whole job is: **get correct rows into those tables.** The score,
sector median, charts, and assessment window all recompute themselves. You can
force a recompute with `select score_company('TECH_MSFT');`.

### What a valid ("scored") company needs
`score_company` marks a company `unknown` (with a reason) unless ALL of these hold:

1. It has **≥ 3 consecutive recent data years** where:
   - `scope12.s12_status = 'ok'`, AND
   - every **material** scope-3 category for its sector is `reported = true` with `row_status = 'ok'`.
2. Scope-2 is available on at least one basis (location and/or market).
3. The window is recent enough (not `data_too_old`).

`unknown_reason` values you may see: `no_scope12_data`, `no_scope3_data`,
`window_too_short` (no run of 3+ consecutive complete years), `data_too_old`,
`scope2_location_missing`. Location and market are scored **independently**.

### Restatements — never overwrite
When a later report restates an earlier year, **insert a new row** for that
`(year, reporting_year=<new report>)` with a `restatement_reason` — do not edit
the old row. The scorer always uses the **latest `reporting_year`** per data year,
and the company page shows the restatement history. This is why one data year can
have several rows.

### Provenance is separate from emissions
Emissions live in `scope12` / `scope3`. **Sources** live in `company_year_review`
(`source_url`, `source_notes` — both public; `review_notes`, `reviewed_by` —
internal, never shown). Every data year should have at least one review row with a
working `source_url`.

### Running SQL against the ThermoStat DB
```
set -a; . ~/.felixep/secrets/supabase-thermostat.env; set +a
node ~/.felixep/dbtool/run-sql.mjs  path/to/file.sql   # writes
node ~/.felixep/dbtool/query.mjs    path/to/file.sql   # read-only
```

Roles: **Claude** runs the SQL and does the mechanical checks. **Felix** (the
climate reviewer) supplies/approves the source reports, decides materiality, spot-
checks the figures, and clears the `NEEDS REVIEW` flag. A company should not go
public while any of its years still say `NEEDS REVIEW`.

---

## Protocol A — Add a new company

**Prerequisite:** the company's sector must already exist in
`sector_category_relevance` (all 15 categories, with `required` set). If it's a new
sector, do **Protocol C** first.

1. **Pick an id.** Convention `SECTORPREFIX_SHORT`, e.g. `FASH_CHAN`, `TECH_MSFT`,
   `MEDIA_ITV`. Keep it stable — it's the URL (`/company/<id>`).
2. **Insert the company** (`companies`): `company_id, company_name, sector,
   country_hq` (+ optional `country_hq_source*`, `reporting_year_*`).
3. **Gather the data.** From the company's annual report / sustainability report /
   CDP: at least **4 consecutive recent years** (aim for one more than the minimum
   3, so a restatement can't drop you below the threshold).
4. **Insert `scope12`** — one row per data year: `year, reporting_year,
   scope1_ghg, scope2_location_ghg, scope2_location_disclosed,
   scope2_market_ghg, scope2_market_disclosed, s12_status='ok'`.
5. **Insert `scope3`** — one row per (year × category) the report gives. For each
   material category: `reported=true, ghg=…, row_status='ok'`. For a material
   category that wasn't reported: `reported=false, not_reported_reason=…`. Use
   `required_override=true` (+ rationale) only to force a category material/not for
   this company against the sector default.
6. **Insert `company_year_review`** — per year: `reviewed_by, source_url,
   source_notes`, and `review_notes='NEEDS REVIEW …'` until a human has checked it.
7. **Scoring runs itself.** Confirm with the verification queries below:
   `score_status='scored'`, a sensible assessment window, score not obviously wrong.
8. **QA** (see checklist), then clear the `NEEDS REVIEW` notes.

---

## Protocol B — Refresh a company to a new reporting year

Run when a company publishes a new report (e.g. FY2025). We currently hold all four
companies through **FY2024**.

1. **Get the new report** and note its reporting year `R` (e.g. 2025).
2. **New data year** — insert `scope12` + `scope3` rows for the newly reported data
   year with `reporting_year=R`, plus a `company_year_review` row with the source.
3. **Restatements** — for any prior year the new report restates, insert a **new**
   `scope12`/`scope3` row `(year=<prior>, reporting_year=R)` with a
   `restatement_reason`; add a review row too. Leave the old rows in place.
4. **Materiality** — if the new report changes which categories are material for the
   sector, update `sector_category_relevance` (this rescoring affects every company
   in that sector — do it deliberately).
5. **Scoring runs itself.** Verify the assessment window now extends to the new year
   and `latest_data_year` updated.
6. **QA** and clear `NEEDS REVIEW`.

---

## Protocol C — Add a new sector (materiality)

Before the first company in a sector. Insert **15 rows** into
`sector_category_relevance` (`sector`, `category` 1–15, `required` bool,
`required_rationale`), deciding which scope-3 categories are material for that
sector's business model (Fashion has 10 required, Media 8, Tech 10 today). Base it
on the GHG Protocol relevance criteria; write the rationale down.

---

## QA checklist (before a company goes public)

- [ ] Every data year has a `company_year_review` row with a **working** `source_url`.
- [ ] Scope 1 / 2 / 3 figures spot-checked against the source PDF (units = tCO₂e).
- [ ] Material categories for the sector are all present (reported, or an explicit not-reported reason).
- [ ] No placeholder / test values (`restatement_reason`, `notes`, etc.).
- [ ] `score_status = 'scored'` and the assessment window looks right.
- [ ] All `NEEDS REVIEW` notes for the company are cleared by a human reviewer.
- [ ] Sanity-check the score direction (rising emissions → hotter; steady cuts → cooler).

---

## Verification queries

```sql
-- Score + status + window for one company (or all)
select company_name, score_status, unknown_reason,
       thermostat_score_location, sector_median_score_location,
       assessment_year_start, assessment_year_end, latest_data_year
from company_scores_public order by company_name;

-- Years held + latest reporting year, per company
select company_id, max(year) as latest_data_year, max(reporting_year) as latest_report
from scope12 group by company_id order by company_id;

-- Any years missing a source
select s.company_id, s.year
from (select distinct company_id, year from scope12) s
left join (select distinct company_id, year from company_year_review where source_url is not null) r
  on r.company_id=s.company_id and r.year=s.year
where r.company_id is null;

-- Any leftover NEEDS REVIEW flags
select company_id, year, reporting_year, review_notes
from company_year_review where review_notes ilike '%NEEDS REVIEW%' order by company_id, year;
```
