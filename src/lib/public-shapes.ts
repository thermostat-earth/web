/**
 * THE THINGS THE BROWSER IS ALLOWED TO IMPORT.
 *
 * Shapes and pure functions, and nothing that touches a database. This file has no imports at
 * all, which is the property that matters — it cannot drag anything in behind it.
 *
 * WHY IT EXISTS, because the bug it fixes is invisible and expensive. Every company page on the
 * live site was replaced by "This page could not load its data" the moment the browser ran its
 * JavaScript. The server HTML was perfect — H&M's figures were all in it — and curl reported a
 * clean 200, so by every check short of opening a real browser the site was fine.
 *
 * The cause was one line. CompanyDetail is a client component and it imported SCOPE3_CATEGORIES,
 * a plain list of the fifteen GHG Protocol category names, from lib/company.ts. That module
 * imports lib/supabase.ts, which calls createClient at the top level and throws by design when
 * NEXT_PUBLIC_SUPABASE_URL is missing. Importing a constant therefore shipped a database client
 * into the browser bundle and the browser does not have that variable, so the throw happened on
 * every page load and the error boundary ate the page.
 *
 * A type-only import would have been free — types are erased. One value was enough.
 *
 * So the pure things live here and the database modules re-export them, which keeps every
 * existing server-side import working. lib/supabase.ts now also imports "server-only", so if a
 * client component ever reaches for it again the BUILD fails and names the file, instead of the
 * site failing silently in front of a reader.
 */

/** GHG Protocol scope-3 category names, indexed 1–15. */
export const SCOPE3_CATEGORIES: Record<number, string> = {
  1: "Purchased goods & services",
  2: "Capital goods",
  3: "Fuel- & energy-related activities",
  4: "Upstream transportation & distribution",
  5: "Waste generated in operations",
  6: "Business travel",
  7: "Employee commuting",
  8: "Upstream leased assets",
  9: "Downstream transportation & distribution",
  10: "Processing of sold products",
  11: "Use of sold products",
  12: "End-of-life treatment of sold products",
  13: "Downstream leased assets",
  14: "Franchises",
  15: "Investments",
};

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

export function completenessCount(
  c: Pick<Completeness, "categories_in_window" | "categories_in_boundary">,
): string {
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

/* A published score as the list pages read it. Lives here rather than in lib/scores.ts
   so that a component never has a reason to import from a module that opens a database. */
export type CompanyScore = {
  company_id: string;
  company_name: string;
  sector: string;
  country_hq: string | null;
  thermostat_score_location: number | null;
  sector_median_score_location: number | null;
  score_status: string;
  unknown_reason: string | null;
  score_location_available: boolean | null;
  score_above_max_location: boolean | null;
  score_below_min_location: boolean | null;
  // A company can have a market-based score and no location-based one: a basis counts only if it is
  // present in EVERY year of the window, so one basis can qualify while the other does not. The
  // list read the location score alone and printed "Not yet scored" over four companies that are
  // scored — Apple, Amazon, Nike and Foxconn — which is a statement about them that is not true.
  thermostat_score_market: number | null;
  sector_median_score_market: number | null;
  score_market_available: boolean | null;
  score_above_max_market: boolean | null;
  score_below_min_market: boolean | null;
  assessment_year_start: number | null;
  assessment_year_end: number | null;
};
