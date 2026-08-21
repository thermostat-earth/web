# Score baseline — captured 2026-08-21, before the reporting-basis work

Step 0 of `REPORTING-BASIS-PLAN.md`. The plan names changing `score_company` as its main risk,
because that function produces the public number. This is what every company scored **before**
anything was touched, so any movement afterwards is visible and has to be explained rather than
discovered later.

Taken from `company_scores_public`.

| Company | Location | Market | Status | Years scored | Latest data |
|---|---|---|---|---|---|
| Chanel (`FASH_CHAN`) | **> 4.0** | **> 4.0** | scored | 2021–2024 | 2024 |
| H&M Group (`FASH_HM`) | 1.5095 | 1.5206 | scored | 2022–2024 | 2024 |
| ITV (`MEDIA_ITV`) | 1.4528 | 1.4589 | scored | 2021–2024 | 2024 |
| Microsoft (`TECH_MSFT`) | **> 4.0** | **> 4.0** | scored | 2020–2024 | 2024 |

Chanel and Microsoft are stored as `4.0` with `score_above_max_* = true`. That is **not** a score of
4°C — the pathway data only runs 1.4°C to 4.0°C, so 4.0 is the edge of what anything can be fitted
against and both companies are worse than the worst pathway we hold. The site already renders this
correctly as "> 4.0" (`formatScore` in `src/lib/temperature.ts`) and pushes those markers clear
above the hot end of the thermometer. An earlier version of this table recorded them as "4.0, the
top of the scale", which invites exactly the wrong reading.

## What this predicts

None of the four has a known basis break, so **every one of these numbers must be identical after
the change.** Any movement is a bug in the new gating, not a finding.

**Only two of the four can actually detect a regression.** Chanel and Microsoft are clamped at the
top of the fittable range, so they would read "unchanged" even if the calculation beneath them broke
completely. H&M at 1.5095 and ITV at 1.4528 are computed to four decimals and shift on any change to
which years are included. **If those two don't move, the change is inert. If they move, it's a bug.**

## How to re-check

```sh
~/.felixep/dbtool/db.sh thermostat <<'SQL'
select company_id, thermostat_score_location, thermostat_score_market,
       score_status, unknown_reason, assessment_year_start, assessment_year_end
from company_scores_public order by company_id;
SQL
```

---

## Result — checked after step 2 (basis gating), 2026-08-21

**Nothing moved.** All four identical, including H&M at 1.5095032111311140925670 and ITV at
1.4528098473557398489030 — every decimal place. Those are the two that would have shifted, so the
gating is genuinely inert rather than accidentally invisible.

**And it does bite.** Proved rather than assumed: inside a transaction, ITV's 2023 and 2024 were
moved to basis 2 and the company was re-scored. It came back `unknown` / `basis_change` — 2021-2022
and 2023-2024 are two runs of two, and neither reaches three years on one basis. The transaction was
rolled back and ITV re-reads 1.4528098473557398489030, unchanged.

So the gate is off when there is no break and on when there is.
