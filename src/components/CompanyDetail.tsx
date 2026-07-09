"use client";

import { useState } from "react";
import Link from "next/link";
import { HorizontalThermometer } from "@/components/HorizontalThermometer";
import { InfoTip, GLOSSARY } from "@/components/InfoTip";
import { scoreColor, formatScore } from "@/lib/temperature";
import type {
  Basis,
  CompanyDetail as CompanyDetailData,
  TrajectoryYear,
} from "@/lib/company";

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
function excludedReason(t: TrajectoryYear, basis: Basis): string {
  const missing: string[] = [];
  const s2 = basis === "location" ? t.scope2_location : t.scope2_market;
  if (t.scope1 == null) missing.push("Scope 1");
  if (s2 == null) missing.push(`Scope 2 (${basis})`);
  if (!t.scope3Reported) missing.push("Scope 3");
  return missing.length
    ? `missing ${missing.join(" and ")}`
    : "outside the most recent unbroken run";
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
}: {
  trajectory: TrajectoryYear[];
  basis: Basis;
  color: string;
  getValue: (t: TrajectoryYear) => number | null;
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
  const inWin = trajectory.map((t, i) => ({ t, i })).filter((x) => x.t.inWindow);
  const max = Math.max(1, ...values.map((v) => v ?? 0));
  const colX = (i: number) => padX + slotW * (i + 0.5);
  const barH = (v: number | null) => (v && v > 0 ? Math.max((v / max) * plotH, 3) : 0);
  const topY = (v: number | null) => padTop + plotH - barH(v);
  // Trend line + dots only span the in-window years, so they align with the bars.
  const linePts = inWin.map((x) => `${colX(x.i)},${topY(values[x.i])}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      <line x1={padX} y1={padTop + plotH} x2={W - padX} y2={padTop + plotH} stroke="hsl(var(--border))" strokeWidth="1" />
      {trajectory.map((t, i) => {
        const v = values[i];
        const x = colX(i);
        return (
          <g key={t.year}>
            <rect x={x - slotW / 2} y={padTop} width={slotW} height={plotH} fill="transparent">
              <title>
                {t.year}: {fmt(v)} tCO₂e{t.inWindow ? " (in assessment window)" : ` · excluded — ${excludedReason(t, basis)}`}
              </title>
            </rect>
            <rect
              x={x - barW / 2}
              y={topY(v)}
              width={barW}
              height={barH(v)}
              rx="2"
              fill={t.inWindow ? color : "hsl(var(--muted-foreground))"}
              opacity={t.inWindow ? 0.9 : 0.3}
              pointerEvents="none"
            />
            <text x={x} y={H - 8} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 11, fontFamily: "var(--font-jetbrains)" }}>
              {t.year}
            </text>
          </g>
        );
      })}
      <polyline points={linePts} fill="none" stroke={color} strokeWidth="1.5" opacity="0.9" pointerEvents="none" />
      {inWin.map((x) => (
        <circle key={x.t.year} cx={colX(x.i)} cy={topY(values[x.i])} r="3" fill={color} pointerEvents="none" />
      ))}
    </svg>
  );
}

export function CompanyDetail({ data }: { data: CompanyDetailData }) {
  const { header: h, trajectory, scope3ByYear, sources } = data;
  const bothAvailable = h.location.available && h.market.available;
  const initial: Basis = h.location.available ? "location" : "market";
  const [basis, setBasis] = useState<Basis>(initial);
  const b = h[basis];
  const score = b.score;
  const color = score != null ? scoreColor(score) : "hsl(var(--muted-foreground))";
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
          <div className="font-mono text-sm text-muted-foreground">Not yet scored</div>
        )}
      </div>

      {score != null && (
        <HorizontalThermometer
          score={score}
          sectorMedian={b.sectorMedian}
          companyName={h.company_name}
          aboveMax={b.aboveMax}
          belowMin={b.belowMin}
        />
      )}

      {score != null && b.sectorMedian != null && (
        <p className="mt-10 text-sm font-bold" style={{ color }}>
          {(() => {
            const d = score - b.sectorMedian;
            if (Math.abs(d) < 0.05)
              return `${h.company_name} is aligned in line with their sector's average.`;
            return `${h.company_name} is aligned to a climate pathway ${Math.abs(d).toFixed(2)}°C ${d > 0 ? "higher" : "lower"} than their sector's average.`;
          })()}
        </p>
      )}

      {/* Emissions trajectory */}
      <SectionHeading>Emissions trajectory · {basis}-based</SectionHeading>
      {trajectory.length === 0 ? (
        <p className="text-sm text-muted-foreground">No trajectory data yet.</p>
      ) : (
        <>
          <TrajectoryChart trajectory={trajectory} basis={basis} color={color} getValue={(t) => (basis === "location" ? t.total_location : t.total_market)} />
          {(h.assessment_year_start || h.assessment_year_end) && (
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
                      title={t.inWindow ? undefined : `Excluded — ${excludedReason(t, basis)}`}
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
                    { label: "Scope 3", tip: GLOSSARY.scope3, get: (t: TrajectoryYear) => t.scope3 },
                    { label: "Total", tip: null as string | null, get: (t: TrajectoryYear) => (basis === "location" ? t.total_location : t.total_market), bold: true },
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
            {scope3ByYear.map((row) => (
              <tr key={row.category} className="border-b border-border/40">
                <td className="py-1.5 pr-3 text-left text-xs">
                  <span className="mr-1.5 font-mono text-muted-foreground">{row.category}</span>
                  <span className="text-foreground">{row.name}</span>
                </td>
                {trajectory.map((t) => {
                  const c = row.cells[t.year];
                  let bg: string | undefined;
                  let content: React.ReactNode = <span className="text-muted-foreground/30">–</span>;
                  if (c && c.reported && c.ghg != null) {
                    const a = 0.08 + Math.pow(c.ghg / s3Max, 0.45) * 0.8;
                    bg = color.replace(")", ` / ${a.toFixed(2)})`);
                    content = compact(c.ghg);
                  } else if (c && c.material) {
                    content = <span className="text-amber-600/70">n/r</span>;
                  }
                  return (
                    <td
                      key={t.year}
                      className={`py-1.5 pl-3 text-right font-mono text-xs ${t.inWindow ? "" : "opacity-50"}`}
                      style={bg ? { background: bg } : undefined}
                    >
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Cells shaded by size. <span className="text-amber-600/70">n/r</span> = material but not reported; – = not reported / not material.
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
                  {s.urls.map((u, i) => (
                    <span key={u}>
                      {i > 0 && <span className="text-muted-foreground">, </span>}
                      <a href={u} target="_blank" rel="noopener noreferrer" className="text-foreground underline decoration-border underline-offset-4 transition hover:decoration-foreground">
                        {hostname(u)}
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
