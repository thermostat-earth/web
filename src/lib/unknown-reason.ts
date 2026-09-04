// Why a company carries no score, in words a reader can act on.
//
// Until 2026-09-04 both places that render an unscored company said "Not yet scored", which
// says we have not got round to it. For H&M that was untrue in a way that mattered: we had
// assessed six years of its disclosure and the reason there is no score is that H&M reports
// capital goods as N/A while its own accounts show SEK 10,679m of capital assets acquired.
// That is a finding about the company, and burying it behind "not yet" hands the reader the
// opposite impression.
//
// The values come from score_company; there are seven and they are listed in migration 045.
// An unrecognised one falls back to the old wording rather than printing a database token.

const REASONS: Record<string, string> = {
  category_not_disclosed: "Not scored — a required Scope 3 category is not disclosed",
  no_scope3_data: "Not scored — no Scope 3 data published",
  no_scope12_data: "Not scored — no Scope 1 and 2 data published",
  scope2_location_missing: "Not scored — no location-based Scope 2 published",
  basis_change: "Not scored — the reporting basis changed, so the years are not comparable",
  data_too_old: "Not scored — the published data is too old",
  window_too_short: "Not scored — too few comparable years",
};

export function unscoredLabel(reason: string | null | undefined): string {
  return (reason && REASONS[reason]) || "Not yet scored";
}
