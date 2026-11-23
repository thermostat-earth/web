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

> ⚠️ **SUPERSEDED BY SECTION 12.** The answer below is half a decision: it keeps relevance
> "internally for the completeness tag", and the completeness tag is PUBLISHED as "10 of 12",
> whose denominator is the boundary assertion this spec is removing. Read section 12 before
> acting on this subsection.

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
| **B** | ~~Score them, disclose the relationship on the company page.~~ **RULED OUT 2026-11-23 — it would breach the NDA.** See below. | — |
| **C** | **Separate entity for ThermoStat.** Walls the consulting business off from a ThermoStat claim and makes the conflict structural rather than incidental. | Incorporation, separate insurance, separate contracts. Real admin. Does not on its own answer the conflict — still needs A or B. |

### What the NDA actually says

Read 2026-11-23, after Felix asked whether he is even permitted to say he works for them. He is
not, and the document is clearer about it than he expected. Read as a careful reader, not a
lawyer.

**Clause 1 defines Confidential Information to include "the fact that discussions are taking
place for the Purpose and any terms or conditions with respect to the Purpose."** The existence
of the engagement is itself confidential, and clause 2(b) forbids disclosing it to any third
party. A line on a public page saying Dawn Sustainability has consulted for this company would
breach it directly. **Option B is therefore impossible, not merely awkward.** A separate
undertaking also bars referring to Chanel's name or trademark "for its own marketing purpose".

**Option A survives.** A general policy — "ThermoStat does not score companies that are
consulting clients of Dawn Sustainability Ltd" — names nobody and discloses nothing. An
inference drawn by a reader who notices Chanel missing from a fashion index is their inference,
not his disclosure. That is defensible rather than watertight and belongs on the list for the
legal review.

### Three findings from the NDA that go beyond the client question

1. **It expressly grants an injunction route.** Clause 8: breach causes "irreparable harm which
   monetary damages will not be sufficient to remedy", and Chanel is entitled to injunctive
   relief. §9 and §10 above describe this as a route that skips the warning letter. Here it is
   not theoretical — it is written into a signed agreement.
2. **The governing law is blank.** Clause 9(e) reads "the laws of [place where the Chanel entity
   is located]" — the template placeholder is still in the executed document, as is the matching
   jurisdiction clause. Which law and which courts is therefore an open question, against Chanel
   Asia. Cheap to fix now by agreement; expensive to argue later. For the lawyer.
3. **A seven-day destruction obligation.** Clause 2(e): on completion, or within seven days of a
   request, return or destroy all Confidential Information *and* every note, analysis and record
   based on it. The Chanel project material needs to be findable and deletable at that notice.
   Clause 6: all obligations survive the end of the work, indefinitely.

### Recommendation

**A, and remove Chanel from the index now rather than at approval.** Judgement call, flagged.

A is the only option left that can be stated in one sentence on the site, and an index whose
entire product is credibility cannot afford a position that needs a paragraph. Beyond the
disclosure question, clause 2(a) limits use of Confidential Information to the Purpose and 2(d)
bars using it "to compete or obtain any competitive or other advantage with respect to Chanel"
or "to carry out service for other clients". Publishing a public assessment of Chanel while
holding their confidential capital goods data invites the allegation that one informed the
other. The evidence trail answers it — all 12 documents came from public chanel.com URLs — but
clause 8 means the allegation can arrive as an injunction rather than as a letter, and clause
9(e) means nobody currently knows which court would hear it.

**It is currently sitting at Review, where an approval publishes it.** That is one click away
from the thing this section exists to prevent, so the removal should not wait for the rest of V2.

**C is worth a separate look on its own merits**, because a defamation claim against ThermoStat
currently reaches the consulting business's assets and client relationships.

---

## 11. Removing Chanel vs removing the fashion sector

Felix, 2026-11-23: *"thoughts on removing chanel vs just removing fashion as a sector for now?"*
The worry behind it is sound — one company missing from a list of its peers is a conspicuous
absence, and a whole missing sector hides it.

**Remove Chanel. Not the sector.** Checked against the data rather than reasoned in the
abstract:

- Fashion is **9 of 27** companies: Adidas, Chanel, Fast Retailing, H&M, Inditex, Kering, LVMH,
  Nike, Shenzhou. A third of the index.
- Of the **7 published scores, 6 are Tech and exactly 1 is Fashion — H&M.** Removing the sector
  means **withdrawing a live published score**. Taking down something already public is a far
  more visible act than never publishing Chanel, and H&M is the company the whole pipeline was
  proved on (plan step 8).
- **The concealment inverts.** A climate index covering Tech, Media and Automotive with no
  Fashion at all is a louder question than one with eight fashion names and no Chanel.
- **Chanel needs no explanation at all.** 20 of 27 are unpublished because they have not been
  through review. Chanel is one of them. Nothing to explain, nobody has to notice.

**Policy wording, when it is published:** frame it as conflicts governance, not as clients.
"ThermoStat does not publish a score where Dawn Sustainability Ltd has a commercial relationship
or other conflict of interest." That reads as governance. "We do not score our clients" reads as
a hint and invites someone to go looking — which is the inference risk, created by the wording
rather than by the absence.

### Neither option fixes the actual hole: there is no "do not publish" block

Looked for one on the assumption it existed. **It does not.** What exists is the opposite:

- `score_locked` sounds like a hold and is not one. It means "figures committed from the ops
  review", and `sync-review-stage.mjs` **promotes** locked companies. Setting it on Chanel would
  advance it, not stop it.
- `apply-approvals.mjs` runs on `thermostat-apply-approvals.timer` every fifteen minutes, reads
  companies at stage `Approved`, and releases their score to the public site. No confirmation
  step.

**So Chanel is one click plus about fifteen minutes from publication, with nothing in between.**
The only control today is Felix remembering not to click — tier 4, the weakest rung on the
ladder in AGENTS.md, protecting the single most consequential action in the product.

**What is wanted** is an explicit `do_not_publish` flag with a required reason, checked by
`apply-approvals.mjs`, which refuses and says why. Tier 2: the wrong thing fails and stops rather
than being remembered. Reversible, loses none of the work already done on Chanel, and it covers
every future client automatically instead of this one case — system rather than instance.

Half an hour of work, and **it is not V2.** It is a safety catch on what is already live, so it
is not blocked by anything in §5. Awaiting Felix.

---

## 12. Relevance — the decision Felix asked for, and the hole in section 2

Added 2026-11-23, after Felix read section 2 and said it had not landed:

> "eh, no we need to decide on relevance. either we remove completely and do not assess, or
> assess but only have data internally and do not publish. score just scores on reported
> categories. can you make sure the methodology is completely updated - it doesn't feel like
> you've full grasped this yet and want to make sure we build the right thing"

He is right that it had not been grasped, and the specific thing section 2 gets wrong is worth
stating before the options, because it is the reason the section reads as half a decision.

### THE HOLE: "keep relevance internally for the completeness tag" still publishes the judgement

Section 2 removes the fifth reason — "does not apply to this company" — and its mirror, and then
keeps the relevance assessment internally "for the completeness tag". That is not a coherent
position. **The completeness tag is published, and its denominator IS the boundary assertion.**

A company page today reads **"10 of 12 categories reported"**. The 12 is not a fact about the
company's report. It is our judgement that twelve categories apply to it. Publishing "10 of 12"
asserts "there are twelve you should have reported" in exactly the way publishing "does not apply
to this company" does — in a number instead of a sentence, which is harder to contest rather than
less contestable.

So section 2 removes 92 boundary assertions by wording and leaves the same assertion standing as
arithmetic on every company page, plus the Complete/Incomplete badge, the coverage meter, and the
Complete/Incomplete filter on the scores list, all of which are computed from that denominator.

### THREE WAYS RELEVANCE REACHES THE OUTPUT TODAY, counted rather than estimated

**1. It removes reported tonnes from the score.** Where a category is judged not applicable, the
scorer drops the figure the company DID publish for it. Counted in ThermoStat on 2026-11-23:
5 rows, 1 company — Kering, category 13, 2022–24, 1,553 / 1,391 / 1,409 tCO₂e. Kering is
unpublished, so nothing public is wrong today. The mechanism is live for all 22 companies with
relevance rows and would do the same to a large category. **This is the direct contradiction of
"score just scores on reported categories", and it is the half that is a bug rather than a
decision.**

**2. It sets the denominator of the published completeness count**, so judging a category away
makes a company look MORE complete. 433 rows are marked `not_required` across 22 companies.
Complete/Incomplete is therefore partly a measure of our own judgement calls.

**3. It is published directly as the per-category `material` flag** — the greyed rows, and the
amber `n/a` legend reading "material to this company, data not available for that year". That is
the 92 assertions section 2 already agreed to remove.

### WHAT THE STANDARD SAYS, which makes the clean answer available

Checked against the primary PDFs on 2026-11-23 rather than remembered:

- Scope 3 Standard §6.2 (Ch.6 requirements box, p.60): *"Companies shall account for all scope 3
  emissions and disclose and justify any exclusions."*
- §5.4 (p.31): *"Companies are required to report scope 3 emissions by scope 3 category."*
- §11.1 Required information (p.119): a reporter must give *"A list of scope 3 categories or
  activities excluded from the inventory with justification of their exclusion"*.
- §6.3 (p.60): non-applicable categories should be reported as zero or "not applicable".
- No completeness threshold exists in the 2011 standard. SBTi has one (C5 exclusions ≤5%, C6 near-
  term coverage ≥67% of reported AND excluded scope 3, C7 long-term 90%). GHG Protocol's March
  2026 revision proposes 95%/5% but every page of it reads "This is not a GHG Protocol Standard;
  all content is draft."

The consequence is the useful part: **the duty to say what was left out, and why, is the
company's.** We do not need a relevance judgement to show a reader an incomplete disclosure. We
can show the company's own list of exclusions and its own justification, because the standard
obliges them to publish it. Where a company has not published it, that absence is itself a
checkable fact about their report and not an opinion of ours.

And the denominator has a factual value available: **15**. The number of scope 3 categories is
defined by the standard, not by us. "Reported 7 of 15 scope 3 categories" is a fact. "Reported 10
of 12 that apply to it" is an assertion.

### THE TWO OPTIONS AS FELIX PUT THEM

Both produce the SAME public output. That is the finding that makes this decision cheap, and it
was not visible until the three mechanisms above were counted.

| | A — remove it, do not assess | B — assess, internal only, never published |
|---|---|---|
| Score | reported categories only | reported categories only |
| Public completeness | "reported 7 of 15", a fact | "reported 7 of 15", a fact |
| Public reasons for a gap | the company's own stated reason, or "no reason published" | same |
| `material` flag, amber `n/a`, Complete/Incomplete badge and filter | removed | removed |
| Review gate | relevance step deleted | step kept, informational, blocks nothing |
| Internal warning that a score rests on a thin boundary | none | kept |
| Evidence base for V2 | none | accumulates |

### RECOMMENDATION: B, and it is close to free

The assessment already runs as part of step 3 for every company and costs nothing extra to keep.
What changes is that it stops touching the score, stops setting a published denominator, and
stops blocking the gate.

The reason not to choose A is narrow and specific. A score computed only on reported categories
cannot tell the difference between a company that discloses everything and one that discloses its
three best categories, and the trend of a flattering subset can be genuinely better than the trend
of the whole. The published "7 of 15" count makes a thin boundary visible, which is most of the
defence — but it cannot tell us whether the seven that are missing are the large ones. The
internal assessment can, and that is the thing that stops us publishing a flattering number
without knowing it is flattering. It costs nothing to keep and cannot be rebuilt retrospectively.

**The hiding problem is not solved by either option**, and the honest position is Felix's own, from
2026-09-11: *"The hiding reward is what it is, it's what they don't disclose and there's nothing we
can do about it except maybe giving an average % of how much that category comprises of total
emissions from other companies in the sector."* That sector share is built and live. Note that it
currently sits NEXT TO a missing category under the heading "Not in the score", which is part of
the boundary assertion being removed — under A or B it has to be re-framed as context on the
reader's side rather than a measure of the hole a company left, or removed with the rest.

### WHAT THE GATE HAS COST, which is the other half of the decision

- 25 relevance decisions recorded, across 8 companies, all between 4 and 11 September.
- On the 15 where the AI's view was also stored, Felix agreed with it **15 times out of 15**. He
  has never overruled it. The learning loop built to capture disagreements has never fired.
- About **72 undecided categories across roughly 20 of 26 companies** are holding the Submit
  button today — Quanta 13, Adidas 8, Warner Bros Discovery 8, ITV 5, Paramount 5. (Reconstructed
  from the live payloads, not read from the page, so close rather than exact.)
- Toyota is never asked the question at all, because we hold no sector rules for Automotive and
  the grid does not render. Same product, no gate, on an accident of sector.
- The gate is **UI-only**: `approve()` in the ops app sets the stage and does not re-check
  readiness. The block exists in the page, not in the system.

Under either option those 72 decisions disappear, which is the single largest unblocking available
before launch.

### THE METHODOLOGY IS NOT CONSISTENT TODAY, AND "COMPLETELY UPDATED" MEANS ALL OF THIS

Felix asked for the methodology to be completely updated. It cannot be done by editing one page:
there are eleven places where two documents answer the same question differently, and the public
methodology page is the most wrong of them. Full list, so none is quietly skipped:

1. **The core rule, live and public.** `src/app/methodology/page.tsx` still says *"A year only
   counts if Scope 1, Scope 2 and all material Scope 3 categories are reported"*. `ts-057`
   abolished that on 2026-09-11 — four days before the page was last edited.
2. **"Incomplete reporting means no score"** on the same public page, while Amazon is published at
   >4.0 °C on "0 of 13 categories".
3. **The ops review page still gates on the abolished rule** (`src/lib/review.ts`, `basketComplete`
   in `completeYears`, and the reviewer-facing line "every required category present" in
   `Review.tsx` / `ReviewSteps.tsx`). Its own comment justifies itself with "the scoring function
   already does this", which stopped being true the day it was written.
4. **PD item 243 is still Ready** and asks for the opposite of what shipped in item 236 the same
   day. Close as superseded. Items 203 and 217 likewise pose as open the question 236 answered.
5. **Completeness as a share of emissions** survives in item 236's description above Felix's own
   correction, and will be read first.
6. **Sector-level materiality** is still the stated methodology in `DATA-PROTOCOLS.md` and,
   publicly, on `about/page.tsx` — *"any emissions category deemed relevant and material"* and
   *"a human climate expert ensures all relevant Scope 3 emissions categories have been
   included"* — against three documents saying sector plays no role and materiality is explicitly
   not ours to assert.
7. **Scope 2**: the public page says location-based is headlined; the scorer computes and stores
   both, and Apple is published on a market-based number.
8. **The combined-line rule is published and not implemented** — `SCRAPER-ASSESSMENT.md` says so
   in terms: "Published on the methodology page 15 September. The scoring window does NOT yet
   enforce it."
9. **The window**: "longest" is live, "most complete" is the agreed rule, built as
   `scoring_window_v2` and never swapped in. Amazon's "0 of 13" is a consequence.
10. **The base year** on the public page describes the first year of the window; section 3 of this
    spec moves it to the company's stated baseline.
11. **A dead reader-facing string**: "Not scored — a required Scope 3 category is not disclosed"
    describes a state that can no longer occur.

Order to fix them in, once the decision below is made: the public methodology page first (1, 2, 7,
8, 9, 10 all land there), then `about/page.tsx` (6), then the ops review page and the scorer
together (3) — they must land in one go or the page and the score disagree, which is the fault
class that cost 11 September. Then `DATA-PROTOCOLS.md`, then the PD items, then the dead string.

### WHAT IS BLOCKED ON FELIX

Only one thing, and it is the choice between A and B above. Everything else in this section is
either a bug with an obvious direction (relevance must stop subtracting reported tonnes from the
score) or documentation that follows from the choice.

Not building until he picks — Felix, 2026-11-23: *"dont build anything yet before we've decided
the plan pls."*
