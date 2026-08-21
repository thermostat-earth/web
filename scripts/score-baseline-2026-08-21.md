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

---

## Result — checked after step 3 (one basket for every year), 2026-08-21

**Nothing moved.** All four identical again; H&M 1.5095032111311140925670 and ITV
1.4528098473557398489030 to every decimal place.

**Rule 1 now actually holds.** Tested: with category 11 marked required for ITV in 2021-2023 but
not 2024, the score comes out at **exactly** the current 1.4528098473557398489030 — because the
basket is taken from the latest year, category 11 is not in it, and it is therefore excluded from
every year rather than inflating the earlier ones. Before this change the same test produced totals
of 712,779 / 840,151 / 833,546 / 318,654.

**The gap condition is NOT implemented.** With category 11 required in every year *including* 2024,
where ITV has no figure, the year still qualifies and contributes zero — totals 712,779 / 840,151 /
833,546 / 318,654 and a score of 1.6673. That is a required category with nothing behind it being
read as zero. Rule 1 says this case should not be scored at all: the category still applies and the
company has stopped disclosing it, which is a gap rather than a basket change.

---

## Result — checked after step 4 (a basket category needs a figure), 2026-08-21

**Nothing moved.** All four identical again, H&M and ITV to every decimal place.

Both halves of Rule 1 now behave:

- **Category no longer applies** — category 11 required for ITV in 2021-2023 only. Scores
  **1.4528098473557398489030**, exactly today's number, because the basket comes from the latest
  year and excludes it from every year. Correct: the past is re-expressed on today's definition.
- **Category still applies, disclosure stopped** — category 11 required in every year including
  2024, where ITV has no figure. Now **unknown**, where before it scored 1.6673 off a 62% "fall"
  that was only the year they stopped reporting.

The reason it gives is `data_too_old` rather than something about the gap, and that is technically
correct — 2024 is disqualified, so the longest run is 2021-2023, which ends outside the two-year
window. But it will read to Felix as "old data" when the real cause is a missing category. **Worth
a more specific reason before this matters on a real company.**

---

## Result — step 5, and a regression I caused and missed

**I broke the basis gating and my own check could not see it.** Migration 003 was built by editing
a dump of the function taken *before* 002 was applied, so applying it silently reverted the basis
gating. The check for 003 was "did any score move" — and basis gating is inert on today's data, so
removing it moved nothing either. **"Nothing moved" was necessary and nowhere near sufficient.**

Found by asserting on the function text rather than on behaviour:

```sh
~/.felixep/dbtool/db.sh thermostat <<'SQL'
select (pg_get_functiondef(oid) ilike '%v_window_basis%')            as has_basis_gating,
       (pg_get_functiondef(oid) ilike '%category = ANY(v_required_cats)%') as has_basket_sums,
       (pg_get_functiondef(oid) ilike '%s3d.ghg IS NOT NULL%')       as has_figure_test
from pg_proc where proname='score_company';
SQL
```

**Rule for editing a stored function from now on:** dump it fresh immediately before editing, and
afterwards assert every earlier change is still present *by name*. Inert changes cannot be verified
by behaviour.

All three now confirmed present, and all three behave:

| Situation | Result |
|---|---|
| Nothing wrong | All four unchanged; H&M 1.5095032111311140925670, ITV 1.4528098473557398489030 |
| Basis break (ITV 2023-24 moved to basis 2) | `unknown` / **basis_change** |
| Category applies, disclosure stopped | `unknown` / **category_not_disclosed** |
| Category stopped applying | Scores exactly today's number |

The last two used to be indistinguishable, and before that both scored a company on a fall it had
not made.
