import { supabase } from "@/lib/supabase";

// What a score covers, and what it does not.
//
// Every company that has three comparable years of scope 1 and scope 2 now gets a score, and the
// score carries a tag saying how much of the company's boundary it actually rests on. The two words
// matter and are used consistently here and in the ops review page:
//
//   BOUNDARY  the set of lines that apply to this company — scope 1, scope 2, and each scope 3
//             category judged relevant to it. Not all fifteen; the ones ruled out are named too.
//   WINDOW    the run of years being scored.
//
// A line is "in window" when the company reported it for every year of the window. Completeness is
// a COUNT of the scope 3 CATEGORIES in window against the ones that apply — "10 of 12" — never a
// percentage. Felix, 2026-09-11: "Can we change 'lines' to 'categories'". Scope 1 and scope 2 are
// deliberately out of that fraction: the window cannot exist without them, so they are in it for
// every company always, and counting them added one to each side and said nothing. They are still
// shown as rows with their own status. Felix was explicit:
// a percentage of the company's own emissions is circular, because the missing categories are
// exactly the ones whose size is unknown. The only percentage on the page is the sector share, which
// is a share of other companies' emissions and so is not circular.

export type CompletenessTag = "complete" | "incomplete";

export type Completeness = {
  company_id: string;
  completeness_tag: CompletenessTag;
  categories_in_window: number;
  categories_in_boundary: number;
  has_not_reported: boolean;
  has_short_history: boolean;
  /** Reported before, and no longer. A different finding from a short history and it must not be
   *  folded into one — a company that withdraws a disclosure is not waiting for time to pass. */
  has_stopped: boolean;
  // Counts behind those flags, so a display can show the shape of what is missing and not only
  // that something is. DERIVED LIVE, unlike the two totals, which the scorer wrote — so a caller
  // must check they add up to (boundary − window) before drawing them separately.
  categories_not_reported: number;
  categories_short_history: number;
  categories_stopped: number;
  /** True when today's figures would produce a different answer from the published one. Normal for
   *  a company under review, whose score is frozen on purpose — and the one thing a reader has no
   *  way to work out for themselves. */
  stale: boolean;
};

export type LinePosition = "in_window" | "outside_window";

export type BoundaryLine = {
  company_id: string;
  line: string;
  category: number | null;
  position: LinePosition;
  reason: string | null;
  // The wording comes from the database, not from this file. It is rendered identically by the ops
  // review page, and the only way to guarantee that is for there to be one copy of the string. Do
  // not restate these sentences in a component.
  status_text: string;
};

export type SectorShare = {
  category: number;
  companies_sampled: number;
  avg_pct_of_scope3: number;
};

const COMPLETENESS_COLUMNS =
  "company_id, completeness_tag, categories_in_window, categories_in_boundary, categories_not_reported, categories_short_history, categories_stopped, has_not_reported, has_short_history, has_stopped, stale";

// READ FROM WHAT THE SCORER WROTE, NOT FROM A FRESH CALCULATION BESIDE IT.
//
// company_completeness recomputes the tag live from today's figures. That is the right thing for the
// ops review page, which has to show what a rescore WOULD do while someone is still deciding. It is
// the wrong thing here, where the job is to say what the number ON THIS PAGE rests on.
//
// They already disagree. Chanel is published at 4.00 from a 2021-2024 window, and its FY2025 report
// does not restate scope 2 for three of those years, so the live view says it has no window at all.
// Reading the live view here would have rendered a score with no tag beside it — the one combination
// this whole design exists to prevent. company_completeness_published (ts-059) reads the counts the
// scorer recorded at the moment it summed those lines.
const COMPLETENESS_VIEW = "company_completeness_published";

/** Every company's tag, keyed by id, for the scores list. */
export async function getCompleteness(): Promise<Map<string, Completeness>> {
  const { data, error } = await supabase.from(COMPLETENESS_VIEW).select(COMPLETENESS_COLUMNS);
  if (error) throw error;
  const out = new Map<string, Completeness>();
  for (const row of (data ?? []) as Completeness[]) out.set(row.company_id, row);
  return out;
}

/** One company's tag, or null where it has no window and so no score. */
export async function getCompanyCompleteness(companyId: string): Promise<Completeness | null> {
  const { data } = await supabase
    .from(COMPLETENESS_VIEW)
    .select(COMPLETENESS_COLUMNS)
    .eq("company_id", companyId)
    .maybeSingle();
  return (data as Completeness) ?? null;
}

/** Every line for one company — in window and out, with the ones that do not apply named too. */
export async function getBoundaryLines(companyId: string): Promise<BoundaryLine[]> {
  const { data } = await supabase
    .from("boundary_line_status")
    .select("company_id, line, category, position, reason, status_text")
    .eq("company_id", companyId);
  return (data ?? []) as BoundaryLine[];
}

/**
 * How much each scope 3 category is worth, on average, for companies in this sector that DO report
 * it. This is the honest answer to "how big is the hole?" — we cannot know what a company did not
 * disclose, so the page shows what the category is typically worth to that company's peers and lets
 * the reader judge.
 *
 * The shares are NOT added together. Felix, 2026-09-11, on whether a combined figure would stand up:
 * "we could just not add them up... if we show the % of the category then the reader can do their
 * own maths". Summing averages taken over different samples produced 142% for Disney, and any fix
 * for that would have been a normalisation we invented. So each category speaks for itself.
 */
export async function getSectorShares(sector: string): Promise<Map<number, SectorShare>> {
  const { data } = await supabase
    .from("sector_category_share")
    .select("category, companies_sampled, avg_pct_of_scope3")
    .eq("sector", sector);
  const out = new Map<number, SectorShare>();
  for (const row of (data ?? []) as SectorShare[]) out.set(row.category, row);
  return out;
}

/** "10 of 12 categories reported" — the count, spelled the same way everywhere it appears. */
export function completenessCount(c: Pick<Completeness, "categories_in_window" | "categories_in_boundary">): string {
  return `${c.categories_in_window} of ${c.categories_in_boundary}`;
}

/**
 * Why a company is tagged incomplete. BOTH reasons show when both apply — Felix was explicit that
 * a company missing a category AND short of years must not have one of those facts hidden by the
 * other, because they are different failings and a reader should see both.
 */
export function incompleteReasons(c: Completeness): string[] {
  const out: string[] = [];
  if (c.has_not_reported) out.push("categories it does not report");
  if (c.has_stopped) out.push("categories it used to report and no longer does");
  if (c.has_short_history) out.push("categories without enough years yet");
  return out;
}
