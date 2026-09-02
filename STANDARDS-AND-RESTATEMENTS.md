# What the standards actually require about restating years

_Researched 2026-08-27, from the sources linked below. This is the evidence behind the scoring
rule, kept so the methodology page can be written from sources rather than memory._

> **Not public copy.** This is the argument and the citations. The wording that goes on
> thermostat.earth needs writing separately and needs Felix's sign-off.
>
> **What is next is not here.** The work lives in Product Development on ops.felixep.com, under
> the *ThermoStat reporting basis* epic.

---

## The question

A company changes what it counts — a subsidiary moves into the boundary, a method improves — and
restates some earlier years but not others. H&M's 2024 report restates 2022 and the 2019 baseline;
their 2023 figure is restated too, by their own account, though we had not captured it.

Does any standard require a company to restate **every** year between its base year and the
current one? Short answer: **no. None of the three do.**

That turns out to be a better position than if they did, because it means a score that rewards a
complete restatement is rewarding something above the minimum, not merely enforcing a rule.

---

## GHG Protocol — the principle, not the procedure

The Corporate Standard's five principles include Consistency, quoted in full:

> **CONSISTENCY** — Use consistent methodologies to allow for meaningful comparisons of emissions
> over time. Transparently document any changes to the data, inventory boundary, methods, or any
> other relevant factors in the time series.

And in the body of the chapter:

> Users of GHG information will want to track and compare GHG emissions information over time in
> order to identify trends and to assess the performance of the reporting company. The consistent
> application of accounting approaches, inventory boundary, and calculation methodologies is
> essential to producing comparable GHG emissions data over time. [...] If there are changes in the
> inventory boundary, methods, data or any other factors affecting emission estimates, they need to
> be transparently documented and justified.

**The argument this gives us.** The standard's own test is *meaningful comparison over time*, not
whether each individual figure is accurate. A series where 2022 includes a subsidiary and 2023 does
not fails that test even though every number in it is correctly transcribed. Restating the whole
series is how a company actually satisfies Consistency; restating only the base year satisfies the
recalculation procedure and leaves the series incomparable.

Note what it stops short of: it requires changes to be *documented and justified*, not that every
year be restated. Our rule enforces the principle the standard states; it does not invent one.

Separately, on base year recalculation, the Protocol requires companies to set and disclose their
own **significance threshold** — 5% and 10% are common conventions, not requirements — and to
recalculate when structural changes, methodology changes or errors cross it.

## SBTi — base year only, and about the target

Recalculation is triggered by a change of **5% or more** in base year emissions within the target
boundary. Verification is required when base year emissions move by **≥5% for scope 1+2** or
**≥10% for scope 3**. The concern is whether the *target* is still valid.

Nothing about intermediate years.

## CSRD / ESRS — forces disclosure of the problem, not the fix

ESRS 1 requires restated comparatives where a metric is redefined or replaced, where new
information changes a prior-period estimate, or where a material prior-period error is found.

ESRS E1 requires an undertaking to disclose significant changes in what constitutes the reporting
undertaking and its value chain, and to **explain their effect on the year-to-year comparability**
of reported emissions.

So CSRD comes closest: it obliges a company to *tell you* the comparison is broken. It does not
oblige them to repair the series.

---

## GHG Protocol chapter 5 — what actually triggers a recalculation

_Read 2026-09-02 from the chapter itself (`pdf.wri.org/ghg_protocol_2004_chp005.pdf`), after Felix
asked what the standard says rather than what we thought. Quotes are exact._

**Structural changes are recalculated because nothing was emitted or avoided.**

> Structural changes trigger recalculation because they merely transfer emissions from one company
> to another without any change of emissions released to the atmosphere.

**Organic growth and decline are not, for the same reason inverted.**

> Base year emissions and any historic data are not recalculated for organic growth or decline.
> Organic growth/decline refers to increases or decreases in production output, changes in product
> mix, and closures and openings of operating units that are owned or controlled by the company.
> The rationale for this is that organic growth or decline results in a change of emissions to the
> atmosphere and therefore needs to be counted as an increase or decrease in the company's
> emissions profile over time.

**This is our own test, in the standard's words.** ThermoStat exists so that a fall in the line
means a fall in emissions. The Protocol draws the same line in the same place: restate when the
atmosphere saw no change, do not restate when it did. That is a stronger footing than a rule we
reasoned out ourselves, and it means the scoring rule can cite the standard rather than argue with
it.

**Two exceptions that stop "applied to every year" being a clean test.**

> Base year emissions are not recalculated if the company makes an acquisition of (or insources)
> operations that did not exist in its base year. There may only be a recalculation of historic
> data back to the year in which the acquired company came into existence.

So a restatement that stops part of the way back can be exactly right, not incomplete.

> Structural changes due to "outsourcing" or "insourcing" do not trigger base year emissions
> recalculation if the company is reporting its indirect emissions from relevant outsourced or
> insourced activities. [...] However, outsourcing/insourcing that shifts significant emissions
> between scope 1 and scope 3 when scope 3 is not reported does trigger a base year emissions
> recalculation.

So a company can move an activity out of scope 1 and legitimately not restate anything, provided it
still reports the emissions in scope 2 or 3. That matters to us because we score a basket: if the
activity lands in a category outside the basket, the emissions leave the score without any
restatement to notice.

**Timing.** A structural change part-way through a year is recalculated for the whole of that year,
and may be deferred to the following year only where the data does not exist yet.

## Scope 3 Standard chapter 9 — the trigger the Corporate Standard does not have

_Read 2026-09-02 from the Corporate Value Chain (Scope 3) Standard, section 9.3. Quotes exact._

The Corporate Standard lists three triggers for recalculation: structural change, methodology or
accuracy change, and significant error. The Scope 3 Standard adds a fourth, and it is the one that
decides reclassification:

> Companies are required to recalculate base year emissions when the following changes occur and
> have a significant impact on the inventory: [...] Changes in the categories or activities included
> in the scope 3 inventory

Table 9.5 splits it. For a company with a single base year and target for total scope 3 — which is
the normal case — both *adding entire categories* and *adding or changing activities within
categories* require recalculation where the cumulative effect is significant. Only a company with
separate base years per category escapes it, and only for adding whole categories.

The reason is given in the same section, and it is our sentence again:

> The company should ensure that changes in the inventory over time are a result of actual emissions
> increases or decreases, not changes in methodology, so that the company tracks "like with like"
> over time.

And on divestment, why the recalculation exists at all:

> [It] allows the company and its stakeholders to understand that the apparent decrease in emissions
> in the third year of reporting is a result of a structural change rather than a change in GHG
> management practices.

Organic growth is excluded in the same words as the Corporate Standard, so the two agree.

---

## Sources

- GHG Protocol, *A Corporate Accounting and Reporting Standard* (revised edition), chapter 1 —
  <http://pdf.wri.org/ghg_protocol_2004_chp001.pdf>
- GHG Protocol, base year recalculation FAQ —
  <https://ghgptechassistance.zendesk.com/hc/en-us/articles/37791741554580-In-what-scenarios-would-I-need-to-recalculate-base-year-emissions>
- GHG Protocol, *Base Year Adjustments* guidance —
  <https://ghgprotocol.org/sites/default/files/2022-12/Base%20Year%20Adjustments.pdf>
- GHG Protocol, *Corporate Value Chain (Scope 3) Accounting and Reporting Standard*, section 9.3 —
  <https://ghgprotocol.org/sites/default/files/standards/Corporate-Value-Chain-Accounting-Reporing-Standard_041613_2.pdf>
- GHG Protocol, *A Corporate Accounting and Reporting Standard*, chapter 5 —
  <http://pdf.wri.org/ghg_protocol_2004_chp005.pdf>
- SBTi Corporate Net-Zero Standard criteria —
  <https://files.sciencebasedtargets.org/production/files/Net-Zero-Standard-Criteria.pdf>
- SBTi Corporate Near-Term criteria —
  <https://files.sciencebasedtargets.org/production/files/SBTi-criteria.pdf>
- ESRS E1 requirements —
  <https://normative.io/insight/esrs-e1/> and
  <https://www.coolset.com/academy/esrs-e1-requirements-climate-change>

## Confidence

The GHG Protocol quotes are taken from the standard itself, extracted from the PDF, and are exact.

The SBTi and ESRS points come from secondary summaries rather than the primary documents — the
thresholds and triggers are consistently reported across sources, but **the exact wording has not
been read in the originals**. Before any of this reaches the public methodology page, the SBTi
criteria PDF and the ESRS text should be read directly.
