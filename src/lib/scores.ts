import { supabase } from "@/lib/supabase";

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
