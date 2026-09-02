# Restatement methodology

> **Status: steps 1, 2 and 4 are settled. Step 3 scenarios one to three are settled; three remain.**
> Written 2026-08-28 with Felix, from the H&M worked example. This is the internal rule; the
> public wording for thermostat.earth is a separate job and needs his sign-off.

## What we are for

We are not verifying anybody's emissions. We are making sure that **a fall in the line means a
fall in emissions** — that what we publish represents true decarbonisation rather than a change
in how the counting was done.

Every rule below follows from that one sentence. When a rule is hard to settle, the question to
ask is not "is this figure right" but *"would including this year alongside the others make a
change in reporting look like a change in emissions?"*

## The test, in order

### 1. Has the year's emissions changed for any category?

We hold every publication of every year as its own row — a restatement is never an overwrite. So
this is answered by comparing publications, not by reading anything.

A year has been restated if any category, or scope 1 and 2, carries a different figure in a later
publication than in an earlier one.

If nothing changed, there is nothing to judge and the year is used as published.

### 2. Is there an explanation for the change?

**Every restated figure needs the company to have said how the methodology changed.** Not a
general statement that figures were updated — an explanation that reaches the year and the
category in front of us.

- **Explained** → go to step 3.
- **Not explained** → the figure is not accepted. If the category is **not required** for this
  company, it is excluded from the scoring boundary — dropped from *every* year of the run, so the
  history is re-totalled without it and the trend is undistorted. If the category **is required**,
  the year fails.

Deliberately strict, for a reason Felix gave on 2026-08-28: being strict here rewards companies
that explain themselves and creates pressure toward better practice. A company that restates a
figure by 28% without a word loses the credit for that disclosure — it is not accused of anything,
it simply stops counting until it is explained.

⚠️ **"Explained" is currently decided by whether the field is empty, and that is wrong.** Found
2026-09-02. `BasisPanel.tsx` treats any text in `company_stated_reason` as an explanation
(`if (!r.company_stated_reason) return true`), and `evidence_health` counts only empty strings as
unexplained. But the field holds two different things: sometimes the company's own words, sometimes
our note *about* the company's words. Three ITV restatements carry notes that say, in terms, that
the company gave no reason:

| Year | Figure | Move | Recorded "reason" |
|---|---|---|---|
| 2022 | scope 1 | −1.6% | "Reason not explicitly stated in report." |
| 2022 | category 3 | −0.9% | "Reason not explicitly stated in 2023 AR." |
| 2022 | category 11 | **+90.9%** | "Reason not explicitly stated in 2023 AR." |

All three are counted as explained and routed away from Felix as settled "by the company's own
words". So the worked example's claim that H&M category 11 is *"the only restatement of seventeen
with no stated reason"* is wrong: it is **four of seventeen**, and the largest of them — ITV
category 11, more than doubling — is not H&M's.

This does not change the rule. It changes who it has been applied to, and it means the affordability
of strictness has never actually been tested.

**Fixed the same day**, on Felix's answer: migration `033-company-words-and-our-note.sql` gives a
restatement two fields. `restatement_reason` is the company's own words and nothing else, so empty
means unexplained; `restatement_note` is ours. ITV's three notes moved across, H&M's page 66 rows
had the company's sentence separated from our commentary around it, and the redundant "Restated from
5072000." bookkeeping was stripped where the number matched the prior figure we already hold.

**Tier 1, not tier 4.** A check constraint on both tables refuses to store a reviewer's phrasing —
"reason not stated", "no reason given" and the like — in the company's field. The rule is not that
we remember which field is which; it is that the database will not accept the wrong one. Verified by
trying it: the update is rejected.

`evidence_health` now reads ITV 3 of 3 unexplained and H&M 1 of 8, and all three ITV restatements
appear under "Needs your decision" on the pipeline page instead of being filed as settled.

⚠️ **Required is not a sector rule.** Whether a category is required for a company comes from the
GHG Protocol together with the business-model and value-chain review of that company. The sector
table is an expectation used as context, never the decision. Where no determination has been made
for a company, step 2's consequence cannot be settled — the determination has to be made first.

### Where this sits in the review

Settled 2026-08-28. The business-model and value-chain review comes **first**, and it is done
**per year**: what the GHG Protocol requires of this company, for that year, given what the company
actually did that year. Restatements are judged after it, because step 2's consequence — exclude if
optional, fail if required — cannot be evaluated without knowing which categories were required in
the year being judged.

**Which comes first resolves once relevance carries a validity range**, which is already the design
in `REPORTING-BASIS-PLAN.md` section 4 and is not built yet. A determination is made **once**, dated
from a year, and holds forward until something happens that could invalidate it. It is not remade
annually — relevance changes when the business changes, not when the calendar does.

That makes the order a sequence rather than a loop:

1. One business-model and value-chain determination, dated from the earliest year in the run.
2. It holds forward, populating the per-year applicability the database already supports.
3. A confirmed boundary-changing restatement is **the event that ends one range and opens the
   next** — it is the trigger to revisit the determination, not a competitor to it.

So restatements inform the review without depending on it. Felix, 2026-08-28: the review must not
mean answering the same questions for every year when nothing changed.

For H&M that means one determination covering 2019 onward, and the Sellpy restatement raising
exactly one question — did the group change in 2022 such that the determination no longer holds —
rather than a per-year grind across fifteen categories and four years.

**What re-opens a determination** (Felix, 2026-08-28). Holding forward is only safe if something
watches for the business changing. Two triggers, and both are needed:

- **External checks.** Acquisitions, disposals, restructures — things that change what the company
  is, which will not always appear in an emissions note. Watched independently of the reports.
- **Methodology statements in the emissions sections of reports.** A company saying it has changed
  what it counts is the company telling us the determination may be stale. Read from the report at
  capture, not inferred from the numbers.

Either trigger re-opens the determination from the year it applies. Neither is built.

### 3. Do we accept the reason?

**Scenario one is settled (2026-09-02). The other five are still open.**

The framing agreed so far: we are not judging whether the reason is *true*. We take the company at
their word about what they did. We are judging **which kind of change it was**, because the kinds
have different consequences for comparability.

The scenarios still to be decided, one at a time:

- Better measurement of the same things — factors, actuals replacing estimates, errors corrected
- The boundary moved — acquisition, divestment, a subsidiary consolidated, a standard widening scope
- Reclassified between categories with nothing entering or leaving
- A change in what the company chooses to disclose
- A reason given that does not reach the year or category it is attached to
- A reason too vague to place in any of the above

#### Scenario one, settled 2026-09-02: a methodology change

Felix's rule, and it replaces the question it was asked to answer:

> As long as all years are updated, we add it into the scoring. If years are missing, we remove the
> category from the scoring window if it is optional, or reject the window if it is a required
> category.

**Why this is better than arguing about the kind of change.** The test stops being "was this better
measurement or a wider boundary", which is a judgement two reasonable people can split on, and
becomes "was it applied to every year", which is a fact about the rows in front of us. It also
generalises: a company that acquires a business and restates its whole history is comparable, and
one that restates only the recent years is not, whatever label the change carries.

So the H&M traceability question no longer decides anything about the score. H&M applied it to 2019,
2022, 2023 and 2024, so category 1 goes in. **The label still matters for one thing**: a boundary
change means the company changed what it *is*, which is one of the two triggers that re-opens the
business-model determination. It moves from being a scoring decision to being a trigger.

**"All years updated" is satisfied by the company saying so** (Felix, 2026-09-02). Not only by our
seeing every year's figure move. This is the page 66 rule from step 2 carried forward deliberately —
without it the same sentence in the same report would be accepted as evidence at step 2 and rejected
at step 3.

**A third outcome: not decidable yet.** Accept and reject are not the only answers, because "years
are missing" has two possible causes and they deserve opposite treatments:

| Cause | What it means | What we do |
|---|---|---|
| The company did not apply it to every year | The years do not mean the same thing | Reject, per the rule above |
| **We have not read the whole publication** | We do not know yet | **Neither. Go and read it** |

Felix, 2026-09-02: *"need to make sure every possible literature has been read before claiming the
explanation is not published."* A company must not lose a scoring window because of a gap in our
reading. This applies to step 2 as much as step 3 — calling a restatement unexplained is a claim
about the whole document set, not about the pages we happened to open.

**The case that forced this.** Microsoft's 2025 report states the LCA update was applied to all
prior years. We hold **5 figures** from that publication where every other Microsoft publication
gave 15. Category 2 appears restated across 2020–2023, category 1 for 2022 alone. Read naively,
Microsoft's category 1 fails and the whole window is rejected — on the strength of our own partial
reading. `capture_gaps` does not catch it, because it looks for missing *years* in scope 1 and 2,
not missing *categories* in scope 3.

**Still needs the business-model review.** The optional-versus-required half of the rule cannot fire
on any company today, because no real determination exists for any of them. Same dependency step 2
already carries.

**And "part-read" is not a state to work around** (Felix, 2026-09-02: *"should part read even be a
thing?"*). The first version of the block only stopped the restatements with no reason given, which
left a judgement call open about which verdicts were safe on partial evidence. The answer is to
remove the question rather than answer it: while any of a company's reports is only part-read,
nothing about that company can be judged at all. Simpler and stricter at once.

**Microsoft, resolved by reading it.** Table 1A on page 3 of the 2025 fact sheet gives all eleven
categories Microsoft reports, for FY20 to FY24. We had five figures from it. The other fifty were
captured on 2026-09-02 and reconcile to the document's own stated scope 3 subtotal for every year —
FY22 and FY23 exactly, FY20 and FY21 within the rounding the document declares.

**It produced no new restatements.** Every other figure in that table matches what we already held.
So category 1 moved in FY22 alone, and categories 3 to 13 did not move at all — which is consistent
with Microsoft's footnote, where the LCA change is attributed to categories 1 and 2 only. The thing
that looked like a company applying a change to one year out of four was a table nobody had
finished reading, and reading it took twenty minutes.
#### Scenario two: the boundary moved — settled 2026-09-02

**Proposal: the same test as scenario one, and nothing new.** Applied to every year in the run,
accept. Not applied to every year, drop the category if it is optional and reject the window if it
is required. A boundary change differs from better measurement in exactly one respect, and it is not
a scoring difference: it is one of the two triggers that re-opens the business-model determination.

**Why the evidence points that way.** Both boundary cases we hold show only the earliest affected
year moving:

| Company | Year | Move | What they said |
|---|---|---|---|
| Chanel | 2021 scope 1 | +18.3% | boundary expanded to include Integrated Suppliers, plus factor updates |
| H&M | 2022 scope 1 | +29.9% | Sellpy moved from category 15 into the group's scope 1 and 2 boundary |

Chanel's 2022 is identical in the 2022 and 2023 reports. H&M's 2023 is identical in the 2023 and
2024 reports. **A later year not moving is ambiguous** — either the change was applied throughout
and the later year already contained it, or it was applied to one year and no other. Movement alone
cannot separate those two, which is why the test has to be whether the newest publication states
every year on one basis, not whether every year's number changed.

**Settled 2026-09-02, against the standard rather than by argument.** Felix: *"we just maintain
alignment with the entity boundary. If it changes, as long as it has all the required categories and
activities, that's fine."* That is the GHG Protocol's own position — see
`STANDARDS-AND-RESTATEMENTS.md`, chapter 5. The Protocol restates for structural change because it
*"merely transfer[s] emissions from one company to another without any change of emissions released
to the atmosphere"*, and refuses to restate for organic growth because that *"results in a change of
emissions to the atmosphere"*. Same test as ours, in the standard's words.

So the question of what ThermoStat measures does not need answering by us. It is answered: the
entity as currently constituted, with history aligned to it, because a transfer of ownership is not
a change in emissions.

**Three qualifications the standard adds, none of which were in the question:**

1. **Organic growth must not be restated.** Opening or closing units the company owns or controls is
   organic. If a company restates history for that, the restatement itself is the problem — it hides
   a real change in emissions. This is the one case where a fully-applied restatement should still
   break the run.
2. **A restatement that stops part of the way back can be correct.** No recalculation is required
   for an acquisition of operations that did not exist in the earliest year, only back to the year
   the acquired company came into existence. So "not applied to every year" is not automatically a
   failure, and the check must allow that answer.
3. **A boundary change can legitimately produce no restatement at all.** Outsourcing or insourcing
   does not trigger recalculation as long as the emissions are still reported in scope 2 or 3. For
   us that is a live hole: we score a basket, so an activity moved into a category outside the
   basket leaves the score with nothing restated to notice it.
#### Scenario three: reclassified between categories — settled 2026-09-02

**The standard has a rule for this and it is the same rule again.** A reclassification is a change
in *"the categories or activities included in the scope 3 inventory"*, which the Scope 3 Standard
lists as a required trigger for recalculation (section 9.3, table 9.5). So: applied to every year,
accept. Not applied to every year, drop the category if optional and reject the window if required.

Three scenarios, one test. That is worth saying plainly, because it means step 3 is not six
different rules — it is one rule and a list of things that do not qualify.

**What is different here is ours, not the standard's.** A reclassification leaves the company's
year total unchanged by definition, so the arithmetic check behind the `category_move` verdict
passes automatically. But **we do not score a total, we score a basket** — the categories taken from
the most recent year. An activity moved out of a scored category into one outside the basket leaves
the score with the year total intact and nothing anywhere to notice it.

**How a move is decided, settled 2026-09-02.** Felix: *"all we can do for this is take the category
affected, and test the statement they give for it. Then it's a pass or fail based on what they say.
An arithmetic check would be nice as a secondary check but I don't think it can be used for
pass/fail."*

The arithmetic cannot decide it because a company restates several things in one report. H&M's 2024
report moved Sellpy into scope 1 and 2 **and** grew category 1 by 1.95m tCO₂e for unrelated reasons,
in the same publication — so the year total moves whether or not the reclassification was real, and
a total that holds could be two changes cancelling out. The gate that used to refuse a move verdict
on a moved total was refusing correct verdicts and catching nothing.

What decides it: **the company's statement for the affected category.** A move is a claim about
where emissions went, so with no statement there is no claim to accept, and the verdict is refused.
The arithmetic is still run and shown, and is now stored beside the verdict, so a decision can be
read back later with the numbers that were on the screen when it was made.

The basket concern stands and is not solved by this: a move into a category outside the scored
basket removes emissions from the score. It is now a question the reviewer must answer from the
company's words — *only choose this if what it moved into is still counted* — rather than something
the arithmetic can catch.

**H&M's Sellpy case is this shape running the safe way.** Sellpy's emissions moved from category 15
into the group's scope 1 and 2 — into the score rather than out of it, since scope 1 and 2 are
always counted. Worth noting that we cannot actually run the total-unchanged test on it: H&M gave no
separate category 15 figure in the 2022 or 2023 reports, recording it as aggregated rather than
split, so the only category 15 figures we hold come from the 2024 report onward. There is no
before-figure to compare against.



#### Scenario one: the evidence, gathered 2026-09-02

Facts from the seventeen restatements we hold, checked against the database today. **No verdict —
scenario one is still open and the question below is Felix's.**

**Which restatements scenario one would cover.** Seven of seventeen read as better measurement of
the same things: H&M 2022 and 2023 category 4 (about 1%, calculation changes), H&M 2022 and 2023
category 12 (−28.3% and −30.3%, better waste statistics), and all five Microsoft rows (−10.7% to
+10.5%, one LCA methodology update applied to every prior year).

**That kills the "split by size" option.** A threshold generous enough to keep Microsoft's −10.7%
and H&M's −30.3% on the accept side would have to sit above 30%, at which point it no longer
separates them from the +38.5% case it exists to catch. The two clean examples of better
measurement in our data are among the largest movements in it. Size does not track the distinction.

**The H&M question's consequence is smaller than the handover assumed.** The handover says calling
expanded traceability a boundary change "would break H&M's run at 2022". Checked against the rows:
it would not, on its own. H&M's category 1 history is 2019, 2022, 2023 and 2024, and **the winning
figure for every one of those years comes from the 2024 report** — 2019 exists in our data in no
other publication. All four years are on the post-traceability basis already, so under step 4 the
run is consistent whichever way the question is answered.

⚠️ **But only if the basis attaches to the publication, not the calendar year.** Stage 7 — the piece
that writes `basis_id` and is not built — could reasonably stamp "boundary change at 2022, new basis
from 2022", which would split 2019 from 2022 and break the run for a change that was applied to
both. `score_company` compares the basis of each year's *winning row*, so the correct rule is that
the basis belongs to the publication a figure was taken from. **This is a design constraint on stage
7, recorded here before it is built.**

What the question does still decide for H&M is whether the 2022 restatement fires the re-open
trigger on the business-model determination.

### 4. Was it applied to every year in the run?

Settled 2026-08-28. **Work backwards from the most recent year and check each earlier year is
consistent with it.** The newest publication is the company's current position, so it is the
reference; a run holds only as far back as the years that share it.

This matches how the score already behaves — the scored basket is taken from the most recent year
and every earlier year must contain it — so the two rules point the same way rather than fighting.

## The worked example: H&M

Eight restatements across 2022 and 2023, from the 2024 Annual and Sustainability Report.

**Step 1** — all eight changed. Confirmed by comparing the 2022 and 2023 disclosures against the
2024 report.

**Step 2** — seven carry an explanation. One does not: **2022 category 11, use of sold products,
1,442,000 → 1,851,000 tCO₂e, +28.4%.** Checked against the document itself rather than our
database: the report's emissions note, its improved-data-quality section on page 66, and its
target footnote all say nothing about it.

Across all four companies we hold, that is the **only** restatement of seventeen with no stated
reason. Strictness here is affordable.

**The page 66 question, resolved 2026-08-28 by reading the page.** The section does open by saying
it covers *"specifically 2023 figures and baseline 2019 figures"*, and it quantifies only those two.
But it closes with:

> "For our full scope 3 emissions, including the use-phase all these changes corresponds to a
> decrease of 1 percent or 119,159 tonnes CO2e for 2023 and a 2 percent or 275,732 tonnes CO2e
> increase for 2019 […] **All these changes have been applied to historical results.**"

That is a statement, not an implication: the changes were applied across the history, which reaches
2022. So the explanation does cover the years it is attached to, and **H&M stays at one failure
rather than three.**

The rule this settles: an explanation reaches a year if the company **says** it was applied to that
year, whether or not the effect on that year is quantified. Quantifying every year is better
practice; not quantifying it is not a failure to explain.

**Step 2 consequence** — cannot be settled yet. Category 11 for H&M has no business-model
determination; it is falling through to the Fashion sector expectation, which is context and not a
rule. That determination has to be made before the consequence is known.
