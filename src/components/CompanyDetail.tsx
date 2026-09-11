"use client";

import { useState } from "react";
import Link from "next/link";
import { HorizontalThermometer } from "@/components/HorizontalThermometer";
import { InfoTip, GLOSSARY } from "@/components/InfoTip";
import { scoreColor, formatScore } from "@/lib/temperature";
import { unscoredLabel } from "@/lib/unknown-reason";
import { CoverageMeter } from "@/components/CoverageMeter";
import { SCOPE3_CATEGORIES } from "@/lib/company";
import type {
  Basis,
  CompanyDetail as CompanyDetailData,
  TrajectoryYear,
  Scope3ByYear,
} from "@/lib/company";
import {
  completenessCount,
  incompleteReasons,
  type Completeness,
  type BoundaryLine,
  type SectorShare,
} from "@/lib/completeness";

const fmt = (n: number | null): string =>
  n == null ? "—" : Math.round(n).toLocaleString("en-GB");

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}


// Lists exactly what a year is missing, for the current basis, so the reason is
// accurate (e.g. H&M 2021 lacks Scope 2 location AND Scope 3).
//
// The fallback used to be "outside the most recent unbroken run" for every year it could not
// otherwise explain, which on 2026-09-04 had H&M's page saying all five years were outside a
// window its own header gave as 2022–2024. Both cannot be true. The years were in the window and
// excluded for a different reason: category 2 has no figure and is material, so no year is
// complete. A page that says the wrong thing confidently is worse than one that says nothing —
// it sends a reader looking at the wrong part of the disclosure, which is the same failure
// migration 045 fixed on the score itself.
function excludedReason(
  t: TrajectoryYear, basis: Basis, s3: Scope3ByYear[], insideWindow: boolean,
): string {
  const missing: string[] = [];
  const s2 = basis === "location" ? t.scope2_location : t.scope2_market;
  if (t.scope1 == null) missing.push("Scope 1");
  if (s2 == null) missing.push(`Scope 2 (${basis})`);
  if (!t.scope3Reported) missing.push("Scope 3");
  if (missing.length) return `missing ${missing.join(" and ")}`;

  // The scopes are all there, so what is missing is a material Scope-3 category. Naming it is the
  // whole value of this line: "category 2 has no figure" tells a reader where to look, and
  // "outside the run" tells them to look somewhere the data is fine.
  // An AGGREGATED category is not a gap. Its number was given, inside another category's line, so
  // the categories still sum correctly and the year is still totallable — which is exactly what the
  // scoring function concludes. Before this, Chanel's page called category 9 "no figure" and blanked
  // all four of its totals, while the score it was printing at the top of the same page had been
  // computed from those years. Two answers to one question, and the page was giving the wrong one.
  const gaps = s3
    .filter((r) => {
      const c = r.cells[t.year];
      return c?.material && !c?.reported && !c?.aggregated;
    })
    .map((r) => r.category);
  if (gaps.length) {
    return `no figure for ${gaps.length === 1 ? "category" : "categories"} ${gaps.join(", ")}`;
  }

  return insideWindow
    ? "not counted — the assessment window needs an unbroken run"
    : "outside the most recent unbroken run";
}

// A year's Total is only meaningful when everything relevant is reported:
// Scope 1, Scope 2 (for the current basis), and every material Scope-3 category.
function yearComplete(t: TrajectoryYear, basis: Basis, s3: Scope3ByYear[]): boolean {
  if (t.scope1 == null) return false;
  const s2 = basis === "location" ? t.scope2_location : t.scope2_market;
  if (s2 == null) return false;
  const material = s3.filter((r) => r.cells[t.year]?.material);
  // Aggregated counts as reported here for the same reason it does in excludedReason: the figure
  // exists inside another category, so the year can be totalled.
  return material.length > 0
    && material.every((r) => r.cells[t.year]?.reported || r.cells[t.year]?.aggregated);
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 mt-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}

// Column-bar chart of total emissions by year, coloured by the company's score.
// In-window years are solid with a trend line; excluded years get a faded bar.
function TrajectoryChart({
  trajectory,
  basis,
  color,
  getValue,
  included,
  reasonFor,
}: {
  trajectory: TrajectoryYear[];
  basis: Basis;
  color: string;
  getValue: (t: TrajectoryYear) => number | null;
  included: (t: TrajectoryYear) => boolean;
  reasonFor: (t: TrajectoryYear) => string;
}) {
  const W = Math.max(320, trajectory.length * 64);
  const H = 190;
  const padX = 12;
  const padTop = 22;
  const padBottom = 24;
  const plotH = H - padTop - padBottom;
  const slotW = (W - padX * 2) / trajectory.length;
  const barW = Math.min(30, slotW * 0.5);
  const values = trajectory.map(getValue);
  // Only complete years get a bar/line/dot; the y-scale is based on those too.
  const inc = trajectory.map((t, i) => ({ t, i })).filter((x) => included(x.t));
  const max = Math.max(1, ...inc.map((x) => values[x.i] ?? 0));
  const colX = (i: number) => padX + slotW * (i + 0.5);
  const barH = (v: number | null) => (v && v > 0 ? Math.max((v / max) * plotH, 3) : 0);
  const topY = (v: number | null) => padTop + plotH - barH(v);
  const linePts = inc.map((x) => `${colX(x.i)},${topY(values[x.i])}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      <line x1={padX} y1={padTop + plotH} x2={W - padX} y2={padTop + plotH} stroke="hsl(var(--border))" strokeWidth="1" />
      {trajectory.map((t, i) => {
        const isInc = included(t);
        const v = values[i];
        const x = colX(i);
        return (
          <g key={t.year}>
            <rect x={x - slotW / 2} y={padTop} width={slotW} height={plotH} fill="transparent">
              <title>
                {isInc ? `${t.year}: ${fmt(v)} tCO₂e` : `${t.year}: total not shown — ${reasonFor(t)}`}
              </title>
            </rect>
            {isInc && (
              <rect
                x={x - barW / 2}
                y={topY(v)}
                width={barW}
                height={barH(v)}
                rx="2"
                fill={color}
                opacity={0.9}
                pointerEvents="none"
              />
            )}
            <text x={x} y={H - 8} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 11, fontFamily: "var(--font-jetbrains)" }}>
              {t.year}
            </text>
          </g>
        );
      })}
      {/* halo underneath so the line + dots stand out against the bars */}
      <polyline points={linePts} fill="none" stroke="hsl(var(--background))" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
      <polyline points={linePts} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
      {inc.map((x) => (
        <circle key={x.t.year} cx={colX(x.i)} cy={topY(values[x.i])} r="3" fill={color} stroke="hsl(var(--background))" strokeWidth="1.5" pointerEvents="none" />
      ))}
    </svg>
  );
}


/**
 * WHAT THIS SCORE COVERS — the boundary, line by line.
 *
 * The whole point of scoring every company rather than only the well-disclosed ones is that the
 * score has to be readable alongside what it rests on. So this section is not an appendix: it is
 * the part that stops a 1.5°C built on two lines being read the same way as a 1.5°C built on
 * sixteen.
 *
 * Three groups, in the order a reader needs them:
 *   1. counted    — reported for every year we score
 *   2. missing    — applies to this company, but not in the window, with WHY and what the category
 *                   is typically worth in this sector
 *   3. no apply   — ruled out of the boundary, named rather than silently dropped
 *
 * The wording of each line's status comes from the database column, not from this file, so the
 * public page and the internal review page cannot describe the same line differently.
 */
function CoverageSection({
  completeness,
  lines,
  shares,
  sector,
  windowStart,
  windowEnd,
}: {
  completeness: Completeness | null;
  lines: BoundaryLine[];
  shares: Record<number, SectorShare>;
  sector: string;
  windowStart: number | null;
  windowEnd: number | null;
}) {
  if (!completeness || lines.length === 0) return null;

  const label = (l: BoundaryLine) =>
    l.line === "scope1" ? "Scope 1"
      : l.line === "scope2" ? "Scope 2"
      : `Category ${l.category} · ${SCOPE3_CATEGORIES[l.category ?? 0] ?? ""}`;

  const order = (l: BoundaryLine) =>
    l.line === "scope1" ? -2 : l.line === "scope2" ? -1 : (l.category ?? 99);
  const sorted = [...lines].sort((a, b) => order(a) - order(b));

  const counted = sorted.filter((l) => l.position === "in_window");
  const missing = sorted.filter((l) => l.position === "outside_window" && l.reason !== "outside_boundary");
  const notApplicable = sorted.filter((l) => l.reason === "outside_boundary");
  const complete = completeness.completeness_tag === "complete";
  const reasons = incompleteReasons(completeness);

  return (
    <>
      <SectionHeading>What this score covers</SectionHeading>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
              complete
                ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
                : "bg-amber-500/12 text-amber-700 dark:text-amber-500"
            }`}
          >
            {complete ? "Complete" : "Incomplete"}
          </span>
          <span className="text-sm font-medium">{completenessCount(completeness)} categories reported</span>
          {windowStart != null && windowEnd != null && (
            <span className="text-xs text-muted-foreground">
              scored over {windowStart}–{windowEnd}
            </span>
          )}
        </div>
        {/* The same blocks as the scores list, so the shape of what is missing is recognisable
            before the reader has read a word of the list below it. showLabel is off because the
            count and the sentence are both already on this page — repeating them under the blocks
            would be three statements of one fact. */}
        <CoverageMeter completeness={completeness} showLabel={false} />
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {complete ? (
            <>
              Every scope 3 category that applies to this company was reported for every year of
              the scoring window, alongside its scope 1 and scope 2.
            </>
          ) : (
            <>
              This score is built on {completeness.categories_in_window} of the{" "}
              {completeness.categories_in_boundary} scope 3 categories that apply to this company,
              alongside its scope 1 and scope 2 — it has{" "}
              {reasons.join(" and ")}. We cannot know what an undisclosed category is worth, so each
              one below is shown with what that category is typically worth to other companies in{" "}
              {sector}.
            </>
          )}
        </p>
      </div>

      {missing.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Not in the score</div>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {missing.map((l) => {
              const share = l.category != null ? shares[l.category] : undefined;
              return (
                <li key={l.line} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm">{label(l)}</div>
                    <div className="text-xs text-muted-foreground">{l.status_text}</div>
                  </div>
                  {share != null && (
                    // Each category on its own. These are NOT added up: they are averages taken over
                    // different samples, so a total would be a number we invented rather than one we
                    // measured. The reader can weigh them.
                    <div className="shrink-0 text-right text-xs text-muted-foreground">
                      <span className="font-mono text-foreground">{share.avg_pct_of_scope3}%</span>{" "}
                      of scope 3 on average in {sector}
                      <div className="text-[10px] opacity-70">
                        {share.companies_sampled} {share.companies_sampled === 1 ? "company" : "companies"} sampled
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {counted.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Counted in the score</div>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {counted.map((l) => (
              <li key={l.line} className="flex flex-wrap items-baseline justify-between gap-x-4 px-4 py-2.5">
                <span className="text-sm">{label(l)}</span>
                <span className="text-xs text-muted-foreground">{l.status_text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {notApplicable.length > 0 && (
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium">Outside this company&rsquo;s boundary:</span>{" "}
          {notApplicable.map((l) => `Category ${l.category}`).join(", ")}. These were judged not to
          apply, so they are not counted against it.
        </p>
      )}
    </>
  );
}

export function CompanyDetail({ data }: { data: CompanyDetailData }) {
  const { header: h, trajectory, scope3ByYear, sources, completeness, boundaryLines, sectorShares } = data;
  const bothAvailable = h.location.available && h.market.available;
  const initial: Basis = h.location.available ? "location" : "market";
  const [basis, setBasis] = useState<Basis>(initial);
  const b = h[basis];
  const score = b.score;
  const color = score != null ? scoreColor(score) : "hsl(var(--muted-foreground))";
  const heatHue = Number(color.match(/hsl\(\s*([\d.]+)/)?.[1] ?? 0);
  const meta = [h.sector, h.country_hq].filter(Boolean).join(" · ");

  const s3Max = Math.max(
    1,
    ...scope3ByYear.flatMap((r) =>
      trajectory.map((t) => (r.cells[t.year]?.reported ? r.cells[t.year].ghg ?? 0 : 0)),
    ),
  );
  const compact = (n: number | null): string =>
    n == null ? "" : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : `${Math.round(n)}`;

  return (
    <div>
      <div className="mb-6 inline-flex items-center gap-2">
        <div className="inline-flex overflow-hidden rounded-lg border border-border text-xs">
          {(["location", "market"] as Basis[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setBasis(opt)}
              disabled={!h[opt].available}
              className={`px-3 py-1.5 font-medium capitalize transition-colors disabled:opacity-40 ${
                basis === opt ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt}-based
            </button>
          ))}
        </div>
        <InfoTip text={`${GLOSSARY.location} ${GLOSSARY.market}`} label="Location vs market-based" />
      </div>

      <div className="flex items-center justify-between">
        <Link href="/scores" className="text-sm text-muted-foreground transition hover:text-foreground">
          ← All scores
        </Link>
        <Link href="/methodology" className="text-sm text-muted-foreground transition hover:text-foreground">
          How scoring works →
        </Link>
      </div>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{h.company_name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
          {(h.assessment_year_start || h.assessment_year_end) && (
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              Assessed {h.assessment_year_start}–{h.assessment_year_end}
            </p>
          )}
          {!bothAvailable && (
            <p className="mt-2 text-[11px] text-muted-foreground/70">
              Only {initial}-based data is available for this company.
            </p>
          )}
        </div>

        {score != null ? (
          <div className="flex items-center font-mono text-7xl font-semibold leading-none sm:justify-end sm:text-8xl" style={{ color }}>
            {formatScore(score, b.aboveMax, b.belowMin)}
            <span className="text-3xl sm:text-4xl"> °C</span>
          </div>
        ) : (
          <div className="font-mono text-sm text-muted-foreground">{unscoredLabel(h.unknown_reason)}</div>
        )}
      </div>

      {score != null && (
        <HorizontalThermometer
          score={score}
          sectorMedian={b.sectorMedian}
          companyName={h.company_name}
          aboveMax={b.aboveMax}
          belowMin={b.belowMin}
          soloSector={h.soloSector}
        />
      )}

      {score != null && h.soloSector ? (
        <p className="mt-10 text-sm text-muted-foreground">
          {h.company_name} is the only company we track in the {h.sector} sector
          so far, so there is no sector average to compare against yet.
        </p>
      ) : score != null && b.sectorMedian != null ? (
        <p className="mt-10 text-sm font-bold" style={{ color }}>
          {(() => {
            const d = score - b.sectorMedian!;
            if (Math.abs(d) < 0.05)
              return `${h.company_name}'s climate pathway is aligned with their sector's average.`;
            return `${h.company_name} is aligned to a climate pathway ${Math.abs(d).toFixed(2)}°C ${d > 0 ? "higher" : "lower"} than their sector's average.`;
          })()}
        </p>
      ) : null}

      {/* Emissions trajectory */}
      <SectionHeading>Emissions trajectory · {basis}-based</SectionHeading>
      {trajectory.length === 0 ? (
        <p className="text-sm text-muted-foreground">No trajectory data yet.</p>
      ) : (
        <>
          <TrajectoryChart trajectory={trajectory} basis={basis} color={color} getValue={(t) => (basis === "location" ? t.total_location : t.total_market)} included={(t) => yearComplete(t, basis, scope3ByYear)}
            reasonFor={(t) => excludedReason(t, basis, scope3ByYear,
              h.assessment_year_start != null && h.assessment_year_end != null
                && t.year >= h.assessment_year_start && t.year <= h.assessment_year_end)} />
          {/* When NOTHING is complete the chart is an empty box, and the per-year reasons live in
              hover text that a phone cannot reach. So the cause is written out instead. Found on
              2026-09-04: H&M's chart rendered blank with the explanation reachable only by
              hovering, which is the same thing as no explanation for most readers. */}
          {trajectory.length > 0 && !trajectory.some((t) => yearComplete(t, basis, scope3ByYear)) ? (
            <p className="mt-2 text-xs text-muted-foreground">
              No year can be totalled on this basis, so there is nothing to plot.{" "}
              {(() => {
                // Grouped by reason and named with its years, because a bare list of causes makes
                // the reader work out which year each one belongs to.
                const byReason = new Map<string, number[]>();
                for (const t of trajectory) {
                  const why = excludedReason(t, basis, scope3ByYear, true);
                  byReason.set(why, [...(byReason.get(why) ?? []), t.year]);
                }
                return Array.from(byReason.entries())
                  .map(([why, ys]) => `${ys.join(", ")}: ${why}`)
                  .join(". ");
              })()}.
            </p>
          ) : (h.assessment_year_start || h.assessment_year_end) && (
            <p className="mt-2 text-xs text-muted-foreground">
              Solid bars are inside the assessment window ({h.assessment_year_start}–{h.assessment_year_end}); faded bars are excluded.
            </p>
          )}

          <p className="mb-2 mt-6 text-[11px] tracking-wide text-muted-foreground">All figures in tCO₂e</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border font-mono text-xs text-muted-foreground">
                  <th className="py-2 pr-4 text-left font-normal"></th>
                  {trajectory.map((t) => (
                    <th
                      key={t.year}
                      className={`py-2 pl-4 text-right font-normal ${t.inWindow ? "" : "text-muted-foreground/50"}`}
                      title={t.inWindow ? undefined : `Excluded — ${excludedReason(t, basis, scope3ByYear, false)}`}
                    >
                      {t.year}
                      {!t.inWindow && <span className="ml-0.5">*</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    { label: "Scope 1", tip: GLOSSARY.scope1, get: (t: TrajectoryYear) => t.scope1 },
                    { label: "Scope 2", tip: GLOSSARY.scope2, get: (t: TrajectoryYear) => (basis === "location" ? t.scope2_location : t.scope2_market) },
                    { label: "Scope 3", tip: GLOSSARY.scope3, get: (t: TrajectoryYear) => (t.scope3Reported ? t.scope3 : null) },
                    { label: "Total", tip: null as string | null, get: (t: TrajectoryYear) => (yearComplete(t, basis, scope3ByYear) ? (basis === "location" ? t.total_location : t.total_market) : null), bold: true },
                  ]
                ).map((row) => (
                  <tr key={row.label} className="border-b border-border/50">
                    <td className={`py-2 pr-4 text-left ${row.bold ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {row.label}
                      {row.tip && <InfoTip text={row.tip} />}
                    </td>
                    {trajectory.map((t) => (
                      <td
                        key={t.year}
                        className={`py-2 pl-4 text-right font-mono ${row.bold ? "font-medium" : ""} ${t.inWindow ? "" : "text-muted-foreground/50"}`}
                      >
                        {fmt(row.get(t))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {trajectory.some((t) => !t.inWindow) && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              * excluded from the assessment window (hover the year for why)
            </p>
          )}
        </>
      )}

      <CoverageSection
        completeness={completeness}
        lines={boundaryLines}
        shares={sectorShares}
        sector={h.sector}
        windowStart={h.assessment_year_start}
        windowEnd={h.assessment_year_end}
      />

      {/* Scope-3 by category over years, heat-mapped by size */}
      <SectionHeading>Scope 3 by category (tCO₂e)</SectionHeading>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border font-mono text-xs text-muted-foreground">
              <th className="py-2 pr-3 text-left font-normal">Category</th>
              {trajectory.map((t) => (
                <th key={t.year} className={`py-2 pl-3 text-right font-normal ${t.inWindow ? "" : "text-muted-foreground/50"}`}>
                  {t.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scope3ByYear.map((row) => {
              // Materiality is a property of the company, not a single year — a
              // category is material if it's flagged material in any year.
              const rowMaterial = trajectory.some((t) => row.cells[t.year]?.material);
              return (
                <tr key={row.category} className={`border-b border-border/40 ${rowMaterial ? "" : "text-muted-foreground/40"}`}>
                  <td className="py-1.5 pr-3 text-left text-xs">
                    <span className="mr-1.5 font-mono text-muted-foreground">{row.category}</span>
                    <span className={rowMaterial ? "text-foreground" : ""}>{row.name}</span>
                  </td>
                  {trajectory.map((t) => {
                    const c = row.cells[t.year];
                    let bg: string | undefined;
                    let textColor: string | undefined;
                    let content: React.ReactNode;
                    if (c && c.reported && c.ghg != null) {
                      const light = 86 - Math.pow(c.ghg / s3Max, 0.5) * 44;
                      bg = `hsl(${heatHue} 58% ${light}%)`;
                      textColor = light > 58 ? "#0f172a" : "#f8fafc";
                      content = compact(c.ghg);
                    } else if (c?.aggregated) {
                      // Reported, but inside another category's number. Showing n/a here would
                      // contradict the coverage section above, which counts this line as reported.
                      content = <span className="font-medium text-muted-foreground" title="Reported, but folded into another category">incl.</span>;
                    } else if (rowMaterial) {
                      content = <span className="font-medium text-amber-600">n/a</span>;
                    } else {
                      content = <span className="opacity-40">—</span>;
                    }
                    return (
                      <td
                        key={t.year}
                        className={`py-1.5 pl-3 text-right font-mono text-xs ${t.inWindow ? "" : "opacity-50"}`}
                        style={bg ? { background: bg, color: textColor } : undefined}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Cells shaded by size. <span className="font-medium text-amber-600">n/a</span> = material to this company, data not available for that year.{" "}
        <span className="font-medium">incl.</span> = reported, but folded into another category&rsquo;s figure, so it has no separate number.
        Greyed-out rows are categories not material to this company.
      </p>

      {/* Sources */}
      {sources.length > 0 && (
        <>
          <SectionHeading>Sources</SectionHeading>
          <ul className="flex flex-col gap-2 text-sm">
            {sources.map((s) => (
              <li key={s.year} className="flex items-baseline gap-3">
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{s.year}</span>
                <span className="flex flex-wrap gap-x-1">
                  {s.items.map((it, i) => (
                    <span key={it.url}>
                      {i > 0 && <span className="text-muted-foreground">, </span>}
                      <a
                        href={it.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={it.notes ? `${it.notes}\n${it.url}` : it.url}
                        className="text-foreground underline decoration-border underline-offset-4 transition hover:decoration-foreground"
                      >
                        {hostname(it.url)}
                      </a>
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

    </div>
  );
}
