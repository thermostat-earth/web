import { supabase } from "@/lib/supabase";

/* CompanyScore moved to public-shapes.ts and is re-exported. See the note at the top of that
   file: the client components that render these were importing the type from here, and while a
   type import is erased and was never the bug, "it is only a type" is the same reasoning that
   made the import which WAS the bug look safe. One place for anything a component may touch. */
export type { CompanyScore } from "@/lib/public-shapes";
import type { CompanyScore } from "@/lib/public-shapes";

const COLUMNS =
  "company_id, company_name, sector, country_hq, thermostat_score_location, sector_median_score_location, score_status, unknown_reason, score_location_available, score_above_max_location, score_below_min_location, assessment_year_start, assessment_year_end, thermostat_score_market, sector_median_score_market, score_market_available, score_above_max_market, score_below_min_market";

export async function getScores(): Promise<CompanyScore[]> {
  // A SUPABASE ERROR IS NOT AN Error. `throw error` throws a plain object with message/code/hint on
  // it, and by the time Next.js has turned that into a 500 the fields are gone — the page reports a
  // digest and nothing else. Rethrowing a real Error with the code and hint kept means the boundary
  // in app/error.tsx can print the cause. Added 2026-09-14, while every database-backed page on the
  // deployed site was returning 500 and the message was unreachable without a Vercel API token.
  const { data, error } = await supabase
    .from("company_scores_public")
    .select(COLUMNS)
    .order("thermostat_score_location", { ascending: true });
  if (error) {
    throw new Error(
      `company_scores_public: ${error.message}`
        + (error.code ? ` [${error.code}]` : "")
        + (error.hint ? ` hint: ${error.hint}` : "")
        + (error.details ? ` details: ${error.details}` : ""),
    );
  }
  return (data ?? []) as CompanyScore[];
}
