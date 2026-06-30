import { supabase } from "@/lib/supabase";

// GHG Protocol scope-3 category names, indexed 1–15.
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

export type CompanyHeader = {
  company_id: string;
  company_name: string;
  sector: string;
  country_hq: string | null;
  thermostat_score_location: number | null;
  sector_median_score_location: number | null;
  score_status: string;
  score_above_max_location: boolean | null;
  score_below_min_location: boolean | null;
  assessment_year_start: number | null;
  assessment_year_end: number | null;
};

export type TrajectoryYear = {
  year: number;
  reporting_year: number | null;
  scope1: number | null;
  scope2_market: number | null;
  scope3: number | null;
  total: number | null;
  pathway_temp: number | null;
  data_status: string | null;
};

export type Scope3Category = {
  category: number;
  name: string;
  reported: boolean;
  ghg: number | null;
  notes: string | null;
};

export type SourceLink = { year: number; url: string };

export type CompanyDetail = {
  header: CompanyHeader;
  trajectory: TrajectoryYear[];
  latestYear: number | null;
  scope3: Scope3Category[];
  sources: SourceLink[];
};

const num = (v: unknown): number | null =>
  v == null || v === "" ? null : Number(v);

export async function getCompanyIds(): Promise<string[]> {
  const { data } = await supabase.from("company_scores_public").select("company_id");
  return (data ?? []).map((r) => (r as { company_id: string }).company_id);
}

// Pull everything a detail page needs. Internal QA fields (review_notes, reviewed_by)
// are deliberately never selected — only clean, publishable provenance is surfaced.
export async function getCompany(companyId: string): Promise<CompanyDetail | null> {
  const { data: head } = await supabase
    .from("company_scores_public")
    .select(
      "company_id, company_name, sector, country_hq, thermostat_score_location, sector_median_score_location, score_status, score_above_max_location, score_below_min_location, assessment_year_start, assessment_year_end",
    )
    .eq("company_id", companyId)
    .maybeSingle();

  if (!head) return null;

  const [{ data: chartRows }, { data: scope3Rows }, { data: reviewRows }] =
    await Promise.all([
      supabase
        .from("company_charts_public")
        .select(
          "year, reporting_year, scope1_ghg, scope2_market_ghg, scope3_ghg, total_ghg_market, pathway_temp, data_status",
        )
        .eq("company_id", companyId)
        .order("year"),
      supabase
        .from("scope3")
        .select("year, reporting_year, category, reported, ghg, notes")
        .eq("company_id", companyId),
      // source_url only — reviewer names and review_notes are intentionally excluded.
      supabase
        .from("company_year_review")
        .select("year, source_url")
        .eq("company_id", companyId)
        .order("year"),
    ]);

  const trajectory: TrajectoryYear[] = (chartRows ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    return {
      year: Number(row.year),
      reporting_year: num(row.reporting_year),
      scope1: num(row.scope1_ghg),
      scope2_market: num(row.scope2_market_ghg),
      scope3: num(row.scope3_ghg),
      total: num(row.total_ghg_market),
      pathway_temp: num(row.pathway_temp),
      data_status: (row.data_status as string) ?? null,
    };
  });

  const latestYear = trajectory.length
    ? Math.max(...trajectory.map((t) => t.year))
    : null;

  // Latest reporting year's scope-3 category breakdown.
  const s3All = (scope3Rows ?? []).map((r) => r as Record<string, unknown>);
  const latestS3Year = s3All.length
    ? Math.max(...s3All.map((r) => Number(r.reporting_year ?? r.year)))
    : null;
  const scope3: Scope3Category[] = s3All
    .filter((r) => Number(r.reporting_year ?? r.year) === latestS3Year)
    .map((r) => ({
      category: Number(r.category),
      name: SCOPE3_CATEGORIES[Number(r.category)] ?? `Category ${r.category}`,
      reported: r.reported === true,
      ghg: num(r.ghg),
      notes: (r.notes as string) || null,
    }))
    .sort((a, b) => a.category - b.category);

  // De-duplicate source links, keeping the most recent year per URL.
  const byUrl = new Map<string, number>();
  for (const r of reviewRows ?? []) {
    const row = r as { year: number; source_url: string | null };
    if (!row.source_url) continue;
    const existing = byUrl.get(row.source_url);
    if (existing == null || row.year > existing) byUrl.set(row.source_url, row.year);
  }
  const sources: SourceLink[] = [...byUrl.entries()]
    .map(([url, year]) => ({ url, year }))
    .sort((a, b) => b.year - a.year);

  return {
    header: head as CompanyHeader,
    trajectory,
    latestYear,
    scope3,
    sources,
  };
}
