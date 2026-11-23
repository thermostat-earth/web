# V2 — say what is included, not what ought to be

**Status: SCOPE, for Felix to review. Nothing in here is built.**

Felix, 2026-11-23: *"I've become increasingly worried about the legal challenges of saying
categories should and shouldn't be included. So instead I just want to say what is included and
what isn't, any rationales for this, and then show how much they have increased / reduced using
a mathematical function like normalised area relative to the starting value. Starting value can
be a stated baseline year, and if not given, then first reporting year."* Then: *"obviously
will be a lot of design changes too."*

This replaces the open methodology question in `DESIGN-scoring-completeness.md` §4. That document
stays as the record of V1 and of why it was built that way.

---

## 0. The finding that should be read before anything else

**The maths Felix described is the maths that already runs.**

The scorer computes, for each year of the window:

```
company budget = Σ ( emissions_in_year ÷ emissions_in_base_year ) × 100
pathway budget = Σ ( pathway_in_year  ÷ pathway_in_base_year  ) × 100   -- per temperature bin
score          = the temperature whose pathway budget brackets the company's, interpolated
```

That first line **is** normalised area relative to a starting value. It is a sum of indexed
values over a run of years, which is the discrete integral of the indexed curve. So the function
he asked for is not new work — it is a correct description of what is there.

This matters because it changes what this project is. It is **not** a rewrite of the scoring
engine. It is:

1. removing a judgement we currently publish, and
2. moving the starting value from one year to another, and
3. showing the reader the thing the maths was already doing.

Everything expensive in this document comes from (1) and (3), not from the arithmetic.

---

## 1. What we publish today that Felix no longer wants to publish

Counted from the live database on 2026-11-23, so this is the actual exposure and not an estimate:

| Claim we currently publish | Lines | Companies |
|---|---|---|
| "Not reported in any year we score" — it applies to you and you did not report it | **43** | 13 |
| "Outside boundary" — this category does not apply to you | **49** | 16 |
| "Reported, but not for enough years yet" | 31 | 5 |
| "Reported before, and no longer" | 14 | 2 |

The top two rows are the legal problem, and they are the same problem in two directions. Both are
ThermoStat asserting what a company's emissions boundary *ought* to contain. 92 published
assertions across the set.

The worked example: **capital goods is in H&M's boundary and H&M reports no figure for it in any
year.** The site says so. That is an assertion that H&M ought to be reporting capital goods —
made by us, about a named company, in public.

Rows 3 and 4 are different and probably survive. "Reported before, and no longer" is a statement
about the company's own disclosure record, not about what it should disclose. Flagged here
because the instinct will be to delete all four.

---

## 2. What replaces it

A single list per company, every line of which is a fact about the company's own report:

| | |
|---|---|
| **Included** | we have a figure for every year from the baseline onwards, and it is in the score |
| **Not included** | why, in the company's own terms |

The rationale for "not included" can only ever be one of:

- **Not reported** — the company publishes no figure for it. *No claim that it should.*
- **Reported for some years only** — present from 2022, and our baseline is 2019.
- **Reported inside another figure** — disclosed, but not separately (Google's category 11).
- **Not comparable across the period** — the company restated and the figures either side measure
  different things.

Each carries the company's own wording and a source link where we have one. The ones we hold
already: `base_year_reason`, `source_url`, `status_text`.

**The thing being removed is the fifth reason**, "does not apply to this company", and its mirror
"applies to this company and is missing". Neither can be stated without an opinion about what a
company ought to measure.

### Does the relevance assessment get deleted?

**No — it stops being published.** Recommendation, and it is a judgement call so it is flagged
rather than assumed:

- It keeps earning its place **internally**, because it is what tells us a score built on three
  categories is not comparable with one built on twelve. That is the completeness tag, and the
  tag is about OUR number, not about the company's duty.
- It comes off the public pages and out of the published data.
- The review step stays in the ops app, with the wording changed from "is this relevant" to
  "would including this change what our number means".

Deleting it outright would be cheaper today and would cost the one defence we have against a
company with a flattering partial disclosure.

---

## 3. The baseline

Today the starting value is **the first year of the window** — a 3+ year run the algorithm picks.
Felix wants **the company's stated baseline year, and the first reporting year if it has not
stated one.**

Already built: `company_base_years` holds `base_year`, `base_year_reason`, `restated`,
`source_url`. **12 of 27 companies have one captured.**

How far the data actually reaches, checked company by company:

- For nearly every company with a stated baseline, **the stated baseline is already the earliest
  year we hold** — Adidas 2022, Comcast 2019, H&M 2019, Inditex 2018, Nike 2015, Netflix 2019,
  Paramount 2019, Fast Retailing 2019, Foxconn 2020, Chanel 2021, LVMH 2023.
- One exception the other way: **Quanta** states 2022 and we hold data from 2019.
- So the change is mostly free. The data is there.

**What it changes in practice, and it is not small.** H&M is published on a 2023–2025 window
against a stated baseline of 2019 and six years of data. Scoring 2019→2025 instead of 2023→2025
measures a real transition rather than three recent years. The same is true of Nike (ten years),
Alphabet, ITV and Netflix (seven each).

**The risk this introduces**, named plainly: the window rule exists because figures either side of
a restatement are not comparable, and a longer period crosses more restatements. Checked: there
are **3 confirmed basis breaks across 2 companies**, so the exposure is small and nameable. Where
a baseline sits behind a break, the honest answer is to start at the break and say why.

**Open:** a stated baseline is a company's own choice and companies choose flattering ones. Using
it is Felix's call and it is defensible — it is their number, not ours — but it is the one place
where this change hands a company a lever it did not previously have.

---

## 4. Companies that cannot be scored at all

Unchanged by this, but it becomes much more visible when the headline is a trend:

- **Meta** — 1 year of data
- **Intel**, **Warner Bros Discovery** — 2 years each

A baseline and one later year is not a trend. These need an explicit "not enough years yet"
state that reads as a fact about the data rather than a judgement about the company.

---

## 5. THE PLAN OF ACTION

Agreed with Felix 2026-11-23: keep the temperatures, do the risk-reduction steps, legal review
before launch. His read — *"will mostly be around the relevance assessment stuff i guess"* — is
right about the bulk of the code. It is not right about the bulk of the RISK, which is phase 0
and costs almost no engineering at all. That is the one thing worth correcting before anyone
starts.

Four phases and a gate. **Phase 0 runs now and in parallel with everything** — nothing in it
waits on a methodology decision.

---

### PHASE 0 — the things that are not code

The largest reductions in exposure are here, and none of them is a build task. Doing phase 1
first and these later would be getting the order exactly backwards.

| | | Blocked by |
|---|---|---|
| **0.1** | **Media liability insurance, including defamation cover, in Dawn Sustainability Ltd's name.** Converts an unbounded risk into a known annual premium and pays for the lawyer from the first letter, which is where the cost actually lands. | nothing — Felix |
| **0.2** | **Name the publisher on the site.** Registered name, company number, registered office. Currently absent entirely. It is a disclosure requirement for a limited company, and practically it gives a complainant somebody to write to instead of a solicitor to instruct. | Felix supplying the details |
| **0.3** | **A contact and correction route.** There is none at all today. Cheapest protection available: most disputes end when a figure can be fixed without lawyers. Wire it to the existing `score_history` so a correction is recorded, not just made. | nothing |
| **0.4** | **Decide how clients are handled.** See §10. Chanel is an active client and queued to be scored. | Felix's decision |

### PHASE 1 — the relevance change

The bulk of the code, and the thing Felix is actually worried about.

| | | Blocked by |
|---|---|---|
| **1.1** | Stop publishing the 92 boundary assertions — 43 "applies to you and you did not report it", 49 "does not apply to you". | — |
| **1.2** | Replace with the included / not-included list and its four permitted rationales (§2), each in the company's own terms with a source link. | 1.1 |
| **1.3** | Rework the ops review step: "is this relevant" becomes "would including this change what our number means". ~2,000 lines in one file; the largest single piece of UI work in the project. | 1.2 |
| **1.4** | Keep relevance INTERNALLY, feeding the completeness tag only. The tag is about our number, not the company's duty. | 1.3 |

### PHASE 2 — baseline and scorer

| | | Blocked by |
|---|---|---|
| **2.1** | A `score_baseline` per company: year, whether stated or inferred, the company's wording, the source link. One migration. | — |
| **2.2** | Scorer divides by the baseline year and runs baseline→latest comparable year instead of a 3-year window. The summing and pathway comparison are untouched. | 2.1 |
| **2.3** | Re-score all 27 and look at every one. Every published number moves. | 2.2, 1.4 |

### PHASE 3 — the public pages

Each of these is a risk-reduction step as much as a design one.

| | | Blocked by |
|---|---|---|
| **3.1** | Lead with the company's own checkable fact — "reported emissions down 23% against their stated 2019 baseline" — with the temperature beside it. | 2.2 |
| **3.2** | Workings beside every number: these years, these figures, this baseline, this pathway. | 3.1 |
| **3.3** | Attribute and bound every claim. "ThermoStat's assessment, based on the emissions H&M reports, covering 10 of the 12 categories it discloses" — not "H&M is a 2.8°C company". | 3.1 |
| **3.4** | Coverage caveat beside the score itself, not elsewhere on the page. | 3.3 |
| **3.5** | Surface the evidence trail. Every figure already links to its source document; it is internal only. This is what defeats "you made it up" — and, per §10, what defeats a confidence claim from a client. | — |
| **3.6** | Rewrite the methodology page. It currently explains and defends the boundary judgement being removed, so it is a rewrite rather than an edit. | 1.2 |

### PHASE 4 — design

Felix: *"obviously will be a lot of design changes too."* The company page changes shape: one
number becomes a fact, a trend and a temperature. Scoped once 3.1–3.4 are settled, because the
content decides the layout rather than the other way round.

### THE GATE — legal review before launch

Agreed 2026-11-23. Not a formality and not a rubber stamp at the end: phases 0 and 3 exist to
make that review short and cheap, so it happens **after** phase 3 and **before** thermostat.earth
points anywhere.

Worth paying for specifically: whether the score reads as protected honest opinion given how the
workings are shown; whether the wording in 3.3 holds up; the client position in §10; and whether
the insurance in 0.1 actually covers what we do.

### What can run at once

- **Phase 0 is independent of all of it** and should start today.
- **Phase 2 (baseline/scorer) does not depend on phase 1.** Different files, different people's
  attention. 2.3 is the only join — it needs both.
- **3.5 depends on nothing** and can be built whenever.
- **3.6 cannot start before 1.2**, because it documents what 1.2 decides.

## 6. DECIDED — the temperature stays

*The question §5 was waiting on: does the temperature stay the headline with the percentage
beside it as the workings, or does the trend become the headline and the temperature move to a
supporting role?*

Felix, 2026-11-23: *"do you think companies could put a legal case against temperature, and it's
better to show just a normalised number between -1 and 1, or do you think that has the same
amount of legal risk. if it's similar i would prefer to keep the temp scores but i want to
minimise legal risk."*

**Similar risk. Arguably the index is slightly worse. So the temperature stays**, and his stated
preference holds.

**I am not a lawyer and this is not legal advice.** It is a reading of where the exposure sits,
and §7 below is the part worth acting on either way. A real opinion is needed before launch.

### Why changing the unit does not change the risk

The risk does not attach to the scale. It attaches to **whether a published statement about a
named trading company is a checkable fact or a contestable assertion**, and to whether the basis
for it is shown. "2.8°C" and "−0.4" are both inferences drawn by us from their numbers. Both are
capable of causing a company commercial harm if wrong. Renaming the output does not convert an
inference into a fact.

Three reasons the index is, if anything, the weaker position:

1. **It is less explicable.** A temperature maps to a published IPCC AR6 pathway that anyone can
   go and read. −0.4 maps to a scale we invented. Where a defence depends on showing the basis of
   an opinion, inventing the units cuts against you.
2. **It is harder for the company to check, and therefore harder for them to be satisfied by.**
   Most complaints are resolved before they are complaints, by a company being able to reproduce
   the number. An opaque index makes every query a letter.
3. **It looks like a rating.** A bare signed number between −1 and 1 with no stated meaning reads
   as a grade awarded by us. A temperature reads as a comparison against a named external
   benchmark. The second is a better characterisation of what we actually do.

### What the real exposure was, and it is already being removed

The genuinely exposed statement was never the score. It was the boundary judgement — 92 published
assertions that a company ought to be measuring something it does not. That imputes a failing,
it is about their conduct rather than their arithmetic, and it is ours rather than theirs.

Removing it, which is the change already agreed, is the large risk reduction here. Changing the
unit of the score afterwards would have been motion without much movement.

---

## 7. What actually reduces the risk

In the order they are worth doing. All are buildable alongside the rest of §5.

**1. Every number shows its workings, on the page, next to it.**
The strongest position available is that each score is a stated opinion whose entire basis is
published: these years, these figures, this baseline, this pathway, this arithmetic. A reader who
disagrees should be able to find the exact step they disagree with. This is also just a better
product, which is why it is first.

**2. Lead with the company's own fact, not with our inference.**
"Reported emissions down 23% against their stated 2019 baseline" is checkable against their own
report and is close to unassailable. The temperature sits beside it as the comparison. This is
what Felix asked for anyway, for product reasons — it also happens to be the single best
protective framing available, because the first thing a reader meets is a fact rather than a
judgement.

**3. Attribute and bound every claim.**
"ThermoStat's assessment, based on the emissions H&M reports, covering 10 of the 12 scope 3
categories it discloses" — not "H&M is a 2.8°C company". Same number, and the second sentence
asserts something about the company while the first describes our calculation of their data.

**4. Say what the score does not cover, in the same breath as the score.**
Currently the completeness tag is a label elsewhere on the page. If a score rests on partial
disclosure, that belongs beside the number, every time, unprompted. It is also the honest thing.

**5. A correction route that is easy to find and quick to act on.**
Most disputes end when a company can get a figure corrected without a lawyer. A visible "tell us
this is wrong" that reaches Felix, and a recorded history of what changed and why, is worth more
than any wording. `score_history` already records changes — this is the front door to it.

**6. Keep the evidence trail that already exists.**
Every figure links to the document it came from. That is the thing that makes "we made it up"
unarguable, and it is already built. It should be visible on the public page, not just internally.

---

## 8. The decisions that are still open

The temperature question that blocked §5 is settled in §6. Two remain, both Felix's:

1. **How clients are handled** — §10. Blocks 0.4, and blocks Chanel ever being published.
2. **Whether ThermoStat publishes from Dawn Sustainability Ltd or its own entity** — §10.
   Answered as Dawn Sustainability Ltd on 2026-11-23, and §10 is the reason it is worth one more
   look rather than being closed.

Neither blocks phases 1, 2 or 3.

---

## 9. Exposure that is not about wording at all

Felix, 2026-11-23: *"could there be a situation where i get legal bills regardless of whether i
take something down ie will i always get a warning before i face a proper legal risk?"*

**No guaranteed warning, and a warning costs money by itself.** Not legal advice — the shape of
it, so the pre-launch legal conversation starts from the right place.

- The expected route for defamation is a letter of claim first, and most disputes end there. But
  replying to a letter from a company's firm properly costs real money even where the page comes
  down the same morning, and they usually want more than a takedown.
- A takedown does not extinguish a claim. The cause of action arises on publication; removal
  limits ongoing harm and is strong mitigation, nothing more.
- Routes that skip the warning: a data-protection complaint to the regulator, a trademark or
  copyright complaint to the host or registrar. **Both doors are currently shut** — checked
  2026-11-23: ThermoStat publishes no personal data, only company names, and uses no company
  logos. Both of those are worth keeping shut deliberately rather than by accident. Naming a
  company's sustainability officer, or adding comments, reopens the first.
- **The asymmetry is the risk, not the merits.** Loser pays, defamation costs are
  disproportionate, and a sole publisher against a listed company's legal department is not an
  even fight regardless of who is right.

### What caps it, in order

1. **Media liability insurance including defamation cover.** Converts an unbounded risk into a
   known annual premium, and it pays for the lawyer from the first letter — which is exactly
   where the cost actually lands. This is the single largest lever available and it is not a
   code change.
2. **Publishing from a limited company rather than personally.** Not absolute, and real.
3. §7 above, all of which helps and none of which substitutes for 1 and 2.

### Two gaps found while checking, both cheap

- **No publisher is named anywhere on the site.** No entity, no registered number, no address.
  That is a disclosure requirement for a limited company, and practically it means an annoyed
  company has nobody to write to and goes to a solicitor first.
- **There is no contact or correction route at all.** The footer disclaimer is decent — *"one
  factual measure, not financial advice, an endorsement, or a judgement of a company's overall
  sustainability performance"* — but there is no way for anyone to say a figure is wrong. That is
  the cheapest protection available and it should go in whatever else is decided.

**Neither is blocked by the V2 decisions.** They are worth doing before launch regardless of
which way the methodology goes.

---

## 10. The client conflict

Found 2026-11-23 while checking which entity publishes. **Chanel is an active consulting client
of Dawn Sustainability Ltd and is also sitting at Review on the ThermoStat board, waiting to be
scored and published.** One active project: Chanel Asia Capital Goods Forecasting.

Same company on both sides. Whichever way the score lands it is awkward: a poor score and the
client asks why the company it pays published it; a good score and everybody else asks whether
it was bought. It is not currently disclosed anywhere.

**Checked, and it is the reassuring half:** all 12 Chanel documents held came from public
chanel.com URLs. Nothing came from the consulting engagement. That is the difference between
reading a published report and using what was learned inside a client's business, and only the
first is true here.

**It does open a route I had written off.** §9 says the two routes that skip a warning letter —
a regulator complaint and a host-level takedown — are both shut. There is a third: breach of
confidence, which unlike defamation can get a page down fast, and which a commercial
relationship is exactly what opens. Here the evidence trail closes it, because every figure
links to the public document it came from. That is why 3.5 is worth building rather than leaving
internal: it is the artefact that answers the allegation.

### The options, for Felix

| | | Cost |
|---|---|---|
| **A** | **Do not score clients.** State it publicly as policy — "ThermoStat does not score Dawn Sustainability's clients." Clean, easy to explain, visibly principled. | Loses Chanel from the index, and any future client. A flag on the company record and a line on the methodology page. |
| **B** | **Score them, disclose the relationship on the company page.** "Dawn Sustainability Ltd, which publishes ThermoStat, has provided consulting services to this company." Keeps coverage. | A disclosure field and the wording. Does not remove the commercial awkwardness, only the concealment of it. |
| **C** | **Separate entity for ThermoStat.** Walls the consulting business off from a ThermoStat claim and makes the conflict structural rather than incidental. | Incorporation, separate insurance, separate contracts. Real admin. Does not on its own answer the conflict — still needs A or B. |

**Recommendation, and it is a judgement call so it is flagged rather than assumed: A, plus B's
disclosure for any company that becomes a client later.** A is the only one that is simple enough
to state in a sentence on the site, and a published index whose credibility is its whole product
cannot afford an explanation that takes a paragraph. C is worth a separate look on its own
merits, because a defamation claim against ThermoStat currently reaches the consulting business's
assets and client relationships.

**Not urgent** — Chanel is not published. It becomes urgent the moment it is approved.
