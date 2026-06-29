import { supabase } from "@/lib/supabase";

export type CompanyScore = {
  company_id: string;
  company_name: string;
  sector: string;
  country_hq: string | null;
  thermostat_score_location: number | null;
  sector_median_score_location: number | null;
  score_status: string;
  score_location_available: boolean | null;
  score_above_max_location: boolean | null;
  score_below_min_location: boolean | null;
  assessment_year_start: number | null;
  assessment_year_end: number | null;
};

const COLUMNS =
  "company_id, company_name, sector, country_hq, thermostat_score_location, sector_median_score_location, score_status, score_location_available, score_above_max_location, score_below_min_location, assessment_year_start, assessment_year_end";

export async function getScores(): Promise<CompanyScore[]> {
  const { data, error } = await supabase
    .from("company_scores_public")
    .select(COLUMNS)
    .order("thermostat_score_location", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CompanyScore[];
}
