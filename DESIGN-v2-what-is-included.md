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

## 5. What actually gets built

Ordered by what blocks what.

**A. Data** — a `score_baseline` per company: the year, where it came from (stated vs first
reporting), the company's wording, the source link. One migration.

**B. Scorer** — change the base year the index divides by, and let the period run from baseline to
latest comparable year rather than from a 3-year window. The summing and the pathway comparison
are untouched. This is the smallest code change in the whole document and it is the one that
moves every published number.

**C. Published output** — add the plain figure: *down 23% since 2019*. It falls straight out of
the index that already exists. Add the included/not-included list with its rationales.

**D. Ops review page** — the relevance step is reworded and the determination screen changes.
2,019 lines in that one file today; this is the biggest single piece of UI work.

**E. Public site** — company page, scores page, methodology page. The methodology page has to be
rewritten rather than edited: it currently explains and defends the boundary judgement.

**F. Design** — Felix: *"obviously will be a lot of design changes too."* The headline changes
from one number to a number plus a trend, which changes the company page's whole shape.

**G. Re-score and re-check** — every published company moves. 7 live scores, 27 companies.
Nothing goes public until each has been looked at, because every one of them changes.

---

## 6. The decision that blocks everything else

**Does the temperature score survive?**

The maths produces a temperature because it compares the company's normalised area against IPCC
pathways normalised the same way. "How much have they increased or reduced" is the *input* to
that comparison — it is already computed, one step before the temperature.

So there are two readable products here and they are not the same:

1. **Temperature stays the headline**, and the percentage change is shown beside it as the
   workings. The product is unchanged in identity — a thermometer, a climate temperature score,
   a comparison against 1.5°C pathways. The legal change is real but invisible to a casual reader.
2. **The trend becomes the headline** — "H&M, down 23% since its 2019 baseline" — and the
   temperature either moves to a supporting role or goes. This is a different product. It is
   also a much harder product to argue with, which is the point of the whole change: a
   percentage against a company's own stated baseline is nearly unarguable, where a temperature
   is a claim.

Option 2 is the one that actually answers the worry that started this. Option 1 keeps the
identity, including the name.

Everything in §5 can be built either way. The order of §5 does not change. But C, E and F are
substantially different jobs depending on the answer, so this is worth settling before any of
them start.
