# Score baseline — captured 2026-08-21, before the reporting-basis work

Step 0 of `REPORTING-BASIS-PLAN.md`. The plan names changing `score_company` as its main risk,
because that function produces the public number. This is what every company scored **before**
anything was touched, so any movement afterwards is visible and has to be explained rather than
discovered later.

Taken from `company_scores_public`.

| Company | Location | Market | Status | Years scored | Latest data |
|---|---|---|---|---|---|
| Chanel (`FASH_CHAN`) | 4.0 | 4.0 | scored | 2021–2024 | 2024 |
| H&M Group (`FASH_HM`) | 1.5095 | 1.5206 | scored | 2022–2024 | 2024 |
| ITV (`MEDIA_ITV`) | 1.4528 | 1.4589 | scored | 2021–2024 | 2024 |
| Microsoft (`TECH_MSFT`) | 4.0 | 4.0 | scored | 2020–2024 | 2024 |

## What this predicts

None of the four has a known basis break, so **every one of these numbers must be identical after
the change.** Any movement is a bug in the new gating, not a finding.

Chanel and Microsoft both sit at exactly 4.0, which is the top of the scale rather than a computed
fit — worth remembering when reading a "no change" result, because a clamped value would not move
even if the underlying calculation did. H&M and ITV are the ones that actually prove the gating is
inert: their scores are computed to four decimal places and would shift on any change to which
years are included.

## How to re-check

```sh
~/.felixep/dbtool/db.sh thermostat <<'SQL'
select company_id, thermostat_score_location, thermostat_score_market,
       score_status, unknown_reason, assessment_year_start, assessment_year_end
from company_scores_public order by company_id;
SQL
```
