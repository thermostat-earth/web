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
  Scope3Category,
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
// In-window years are solid; excluded years are faded. The whole column is
// hoverable so even tiny bars reveal their tooltip.
function TrajectoryChart({
  trajectory,
  basis,
  color,
}: {
  trajectory: TrajectoryYear[];
  basis: Basis;
  color: string;
}) {
  const W = Math.max(320, trajectory.length * 64);
  const H = 190;
  const padX = 12;
  const padTop = 22;
  const padBottom = 24;
  const plotH = H - padTop - padBottom;
  const slotW = (W - padX * 2) / trajectory.length;
  const barW = Math.min(30, slotW * 0.5);
  const totals = trajectory.map((t) =>
    basis === "location" ? t.total_location : t.total_market,
  );
  const max = Math.max(1, ...totals.map((v) => v ?? 0));
  const colX = (i: number) => padX + slotW * (i + 0.5);
  const barH = (v: number | null) => (v && v > 0 ? Math.max((v / max) * plotH, 3) : 0);
  const topY = (v: number | null) => padTop + plotH - barH(v);
  const linePts = trajectory.map((t, i) => `${colX(i)},${topY(totals[i])}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 220 }}>
      <line x1={padX} y1={padTop + plotH} x2={W - padX} y2={padTop + plotH} stroke="hsl(var(--border))" strokeWidth="1" />
      {trajectory.map((t, i) => {
        const v = totals[i];
        const x = colX(i);
        return (
          <g key={t.year}>
            {/* full-column hover target */}
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
      {trajectory.map((t, i) => (
        <circle key={t.year} cx={colX(i)} cy={topY(totals[i])} r="3" fill={color} pointerEvents="none" />
      ))}
    </svg>
  );
}

function Scope3Row({ c, max, color }: { c: Scope3Category; max: number; color: string }) {
  let tag: React.ReactNode;
  if (c.reported) {
    tag = <span className="font-mono text-xs">{fmt(c.ghg)}</span>;
  } else if (c.material) {
    tag = (
      <span
        className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800"
        title={c.notReportedReason ?? "Material to this company but not reported"}
      >
        not reported
      </span>
    );
  } else {
    tag = <span className="text-[10px] text-muted-foreground/50">not material</span>;
  }
  return (
    <div className="flex items-center gap-3 text-sm" title={c.notes ?? undefined}>
      <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">{c.category}</span>
      <span className={`w-56 shrink-0 truncate ${c.reported ? "" : "text-muted-foreground/60"}`}>{c.name}</span>
      <div className="hidden h-2 flex-1 sm:block">
        {c.reported && c.ghg != null && (
          <div className="h-2 rounded-full" style={{ width: `${(c.ghg / max) * 100}%`, background: color, opacity: 0.85 }} />
        )}
      </div>
      <span className="flex w-24 shrink-0 justify-end text-right">{tag}</span>
    </div>
  );
}

export function CompanyDetail({ data }: { data: CompanyDetailData }) {
  const { header: h, trajectory, scope3, sources, latestYear } = data;
  const bothAvailable = h.location.available && h.market.available;
  const initial: Basis = h.location.available ? "location" : "market";
  const [basis, setBasis] = useState<Basis>(initial);
  const b = h[basis];
  const score = b.score;
  const color = score != null ? scoreColor(score) : "hsl(var(--muted-foreground))";
  const meta = [h.sector, h.country_hq].filter(Boolean).join(" · ");

  const reportedS3 = scope3.filter((c) => c.reported && c.ghg != null);
  const maxS3 = Math.max(1, ...reportedS3.map((c) => c.ghg ?? 0));

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <Link href="/scores" className="mt-1 text-sm text-muted-foreground transition hover:text-foreground">
          ← All scores
        </Link>
        <div className="flex flex-col items-end gap-2">
          <Link href="/methodology" className="text-sm text-muted-foreground transition hover:text-foreground">
            How scoring works →
          </Link>
          <div className="inline-flex items-center gap-2">
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
          {!bothAvailable && (
            <p className="text-[11px] text-muted-foreground/70">
              Only {initial}-based data is available for this company.
            </p>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{h.company_name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
          {(h.assessment_year_start || h.assessment_year_end) && (
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              Assessed {h.assessment_year_start}–{h.assessment_year_end}
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
          aboveMax={b.aboveMax}
          belowMin={b.belowMin}
        />
      )}

      {/* Emissions trajectory */}
      <SectionHeading>Emissions trajectory · {basis}-based</SectionHeading>
      {trajectory.length === 0 ? (
        <p className="text-sm text-muted-foreground">No trajectory data yet.</p>
      ) : (
        <>
          <TrajectoryChart trajectory={trajectory} basis={basis} color={color} />
          {(h.assessment_year_start || h.assessment_year_end) && (
            <p className="mt-2 text-xs text-muted-foreground">
              Solid bars are inside the assessment window ({h.assessment_year_start}–{h.assessment_year_end}); faded bars are excluded.
            </p>
          )}

          <p className="mb-1 mt-6 text-[11px] uppercase tracking-wide text-muted-foreground">All figures in tCO₂e</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-xs text-muted-foreground">
                  <th className="py-2 pr-4 font-normal">Year</th>
                  <th className="py-2 pr-4 text-right font-normal">Scope 1<InfoTip text={GLOSSARY.scope1} /></th>
                  <th className="py-2 pr-4 text-right font-normal">Scope 2<InfoTip text={GLOSSARY.scope2} /></th>
                  <th className="py-2 pr-4 text-right font-normal">Scope 3<InfoTip text={GLOSSARY.scope3} /></th>
                  <th className="py-2 pr-4 text-right font-normal">Total</th>
                  <th className="py-2 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {trajectory.map((t) => {
                  const s2 = basis === "location" ? t.scope2_location : t.scope2_market;
                  const total = basis === "location" ? t.total_location : t.total_market;
                  return (
                    <tr key={t.year} className={`border-b border-border/50 ${t.inWindow ? "" : "opacity-50"}`}>
                      <td className="py-2 pr-4 font-mono">{t.year}</td>
                      <td className="py-2 pr-4 text-right font-mono">{fmt(t.scope1)}</td>
                      <td className="py-2 pr-4 text-right font-mono">{fmt(s2)}</td>
                      <td className="py-2 pr-4 text-right font-mono">{fmt(t.scope3)}</td>
                      <td className="py-2 pr-4 text-right font-mono font-medium">{fmt(total)}</td>
                      <td className="py-2 pl-2 text-[11px] text-muted-foreground">
                        {!t.inWindow && `excluded — ${excludedReason(t, basis)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Scope-3 breakdown — all 15 categories with their state */}
      <SectionHeading>Scope 3 by category{latestYear ? ` · ${latestYear}` : ""}</SectionHeading>
      <div className="flex flex-col gap-1.5">
        {scope3.map((c) => (
          <Scope3Row key={c.category} c={c} max={maxS3} color={color} />
        ))}
      </div>

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
