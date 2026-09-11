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
// a COUNT of those lines against the boundary — "12 of 14" — never a percentage. Felix was explicit:
// a percentage of the company's own emissions is circular, because the missing categories are
// exactly the ones whose size is unknown. The only percentage on the page is the sector share, which
// is a share of other companies' emissions and so is not circular.

export type CompletenessTag = "complete" | "incomplete";

export type Completeness = {
  company_id: string;
  completeness_tag: CompletenessTag;
  lines_in_window: number;
  lines_in_boundary: number;
  has_not_reported: boolean;
  has_short_history: boolean;
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
  "company_id, completeness_tag, lines_in_window, lines_in_boundary, has_not_reported, has_short_history";

/** Every company's tag, keyed by id, for the scores list. */
export async function getCompleteness(): Promise<Map<string, Completeness>> {
  const { data, error } = await supabase.from("company_completeness").select(COMPLETENESS_COLUMNS);
  if (error) throw error;
  const out = new Map<string, Completeness>();
  for (const row of (data ?? []) as Completeness[]) out.set(row.company_id, row);
  return out;
}

/** One company's tag, or null where it has no window and so no score. */
export async function getCompanyCompleteness(companyId: string): Promise<Completeness | null> {
  const { data } = await supabase
    .from("company_completeness")
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

/** "12 of 14 lines reported" — the count, spelled the same way everywhere it appears. */
export function completenessCount(c: Pick<Completeness, "lines_in_window" | "lines_in_boundary">): string {
  return `${c.lines_in_window} of ${c.lines_in_boundary}`;
}

/**
 * Why a company is tagged incomplete. BOTH reasons show when both apply — Felix was explicit that
 * a company missing a category AND short of years must not have one of those facts hidden by the
 * other, because they are different failings and a reader should see both.
 */
export function incompleteReasons(c: Completeness): string[] {
  const out: string[] = [];
  if (c.has_not_reported) out.push("categories it does not report");
  if (c.has_short_history) out.push("categories without enough years yet");
  return out;
}
