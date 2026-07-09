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

export type Basis = "location" | "market";

export type CompanyHeader = {
  company_id: string;
  company_name: string;
  sector: string;
  country_hq: string | null;
  assessment_year_start: number | null;
  assessment_year_end: number | null;
  location: BasisScore;
  market: BasisScore;
};

export type BasisScore = {
  score: number | null;
  sectorMedian: number | null;
  available: boolean;
  aboveMax: boolean;
  belowMin: boolean;
};

export type TrajectoryYear = {
  year: number;
  scope1: number | null;
  scope2_location: number | null;
  scope2_market: number | null;
  scope3: number | null;
  total_location: number | null;
  total_market: number | null;
  inWindow: boolean;
  scope3Reported: boolean; // whether any Scope 3 was reported that year
};

export type Scope3Category = {
  category: number;
  name: string;
  material: boolean;
  reported: boolean;
  ghg: number | null;
  notReportedReason: string | null;
  notes: string | null;
};

export type Scope3Cell = { ghg: number | null; reported: boolean; material: boolean };
export type Scope3ByYear = { category: number; name: string; cells: Record<number, Scope3Cell> };

export type YearSources = { year: number; urls: string[] };

// IPCC pathway medians keyed by temperature string → year → emissions (Mt CO₂e).
export type Pathways = Record<string, Record<number, number>>;

export type CompanyDetail = {
  header: CompanyHeader;
  trajectory: TrajectoryYear[];
  latestYear: number | null;
  scope3: Scope3Category[];
  scope3ByYear: Scope3ByYear[];
  sources: YearSources[];
};

const num = (v: unknown): number | null =>
  v == null || v === "" ? null : Number(v);

export async function getCompanyIds(): Promise<string[]> {
  const { data } = await supabase.from("company_scores_public").select("company_id");
  return (data ?? []).map((r) => (r as { company_id: string }).company_id);
}

// Pull everything a detail page needs, for BOTH location and market bases so the
// page can toggle between them. Internal QA fields (review_notes, reviewed_by)
// are never selected — only clean, publishable provenance is surfaced.
export async function getCompany(companyId: string): Promise<CompanyDetail | null> {
  const { data: h } = await supabase
    .from("company_scores_public")
    .select(
      "company_id, company_name, sector, country_hq, assessment_year_start, assessment_year_end, thermostat_score_location, thermostat_score_market, sector_median_score_location, sector_median_score_market, score_location_available, score_market_available, score_above_max_location, score_above_max_market, score_below_min_location, score_below_min_market",
    )
    .eq("company_id", companyId)
    .maybeSingle();

  if (!h) return null;
  const head = h as Record<string, unknown>;

  const [{ data: chartRows }, { data: s3Rows }, { data: reviewRows }] =
    await Promise.all([
      supabase
        .from("company_charts_public")
        .select(
          "year, scope1_ghg, scope2_location_ghg, scope2_market_ghg, scope3_ghg, total_ghg_location, total_ghg_market, assessment_window_flag",
        )
        .eq("company_id", companyId)
        .order("year"),
      supabase
        .from("scope3_with_required")
        .select("year, reporting_year, category, reported, ghg, notes, not_reported_reason, effective_required")
        .eq("company_id", companyId),
      supabase
        .from("company_year_review")
        .select("year, source_url")
        .eq("company_id", companyId)
        .order("year"),
    ]);

  // Which years reported any Scope 3 at all — used to explain excluded years.
  const s3All = (s3Rows ?? []).map((r) => r as Record<string, unknown>);
  const yearsWithScope3 = new Set(
    s3All.filter((r) => r.reported === true).map((r) => Number(r.year)),
  );

  const trajectory: TrajectoryYear[] = (chartRows ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    const year = Number(row.year);
    return {
      year,
      scope1: num(row.scope1_ghg),
      scope2_location: num(row.scope2_location_ghg),
      scope2_market: num(row.scope2_market_ghg),
      scope3: num(row.scope3_ghg),
      total_location: num(row.total_ghg_location),
      total_market: num(row.total_ghg_market),
      inWindow: row.assessment_window_flag === true,
      scope3Reported: yearsWithScope3.has(year),
    };
  });

  const latestYear = trajectory.length
    ? Math.max(...trajectory.map((t) => t.year))
    : null;

  // All 15 scope-3 categories for the latest emissions year, de-duplicated per
  // category (keep the most recent restatement), each tagged with its state.
  const latestS3Year = s3All.length
    ? Math.max(...s3All.map((r) => Number(r.year)))
    : null;
  const byCat = new Map<number, Record<string, unknown>>();
  for (const r of s3All.filter((r) => Number(r.year) === latestS3Year)) {
    const cat = Number(r.category);
    const prev = byCat.get(cat);
    if (!prev || Number(r.reporting_year ?? 0) > Number(prev.reporting_year ?? 0)) {
      byCat.set(cat, r);
    }
  }
  const scope3: Scope3Category[] = Array.from({ length: 15 }, (_, i) => i + 1).map((cat) => {
    const r = byCat.get(cat);
    return {
      category: cat,
      name: SCOPE3_CATEGORIES[cat],
      material: r ? r.effective_required === true : false,
      reported: r ? r.reported === true : false,
      ghg: r ? num(r.ghg) : null,
      notReportedReason: (r?.not_reported_reason as string) || null,
      notes: (r?.notes as string) || null,
    };
  });

  // Scope-3 category × year matrix (latest restatement per category-year), using
  // the same year columns as the emissions table.
  const cellByKey = new Map<string, Record<string, unknown>>();
  for (const r of s3All) {
    const key = `${Number(r.category)}|${Number(r.year)}`;
    const prev = cellByKey.get(key);
    if (!prev || Number(r.reporting_year ?? 0) > Number(prev.reporting_year ?? 0)) {
      cellByKey.set(key, r);
    }
  }
  const s3Years = trajectory.map((t) => t.year);
  const scope3ByYear: Scope3ByYear[] = Array.from({ length: 15 }, (_, i) => i + 1).map((cat) => ({
    category: cat,
    name: SCOPE3_CATEGORIES[cat],
    cells: Object.fromEntries(
      s3Years.map((y) => {
        const r = cellByKey.get(`${cat}|${y}`);
        return [y, { ghg: r ? num(r.ghg) : null, reported: r ? r.reported === true : false, material: r ? r.effective_required === true : false }];
      }),
    ),
  }));

  // Group sources by reporting year so every year is represented.
  const yearMap = new Map<number, Set<string>>();
  for (const r of reviewRows ?? []) {
    const row = r as { year: number; source_url: string | null };
    if (!row.source_url) continue;
    if (!yearMap.has(row.year)) yearMap.set(row.year, new Set());
    yearMap.get(row.year)!.add(row.source_url);
  }
  const sources: YearSources[] = [...yearMap.entries()]
    .map(([year, set]) => ({ year, urls: [...set] }))
    .sort((a, b) => b.year - a.year);

  const header: CompanyHeader = {
    company_id: head.company_id as string,
    company_name: head.company_name as string,
    sector: head.sector as string,
    country_hq: (head.country_hq as string) ?? null,
    assessment_year_start: num(head.assessment_year_start),
    assessment_year_end: num(head.assessment_year_end),
    location: {
      score: num(head.thermostat_score_location),
      sectorMedian: num(head.sector_median_score_location),
      available: head.score_location_available === true,
      aboveMax: head.score_above_max_location === true,
      belowMin: head.score_below_min_location === true,
    },
    market: {
      score: num(head.thermostat_score_market),
      sectorMedian: num(head.sector_median_score_market),
      available: head.score_market_available === true,
      aboveMax: head.score_above_max_market === true,
      belowMin: head.score_below_min_market === true,
    },
  };

  return { header, trajectory, latestYear, scope3, scope3ByYear, sources };
}
