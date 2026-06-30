import Link from "next/link";
import { TemperatureBar } from "@/components/TemperatureBar";
import { scoreColor, formatScore } from "@/lib/temperature";
import type { CompanyDetail as CompanyDetailData } from "@/lib/company";

const fmt = (n: number | null): string =>
  n == null ? "—" : Math.round(n).toLocaleString("en-GB");

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 mt-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}

export function CompanyDetail({ data }: { data: CompanyDetailData }) {
  const { header: h, trajectory, scope3, sources, latestYear } = data;
  const score = h.thermostat_score_location;
  const color = score != null ? scoreColor(score) : "var(--muted-foreground)";
  const meta = [h.sector, h.country_hq].filter(Boolean).join(" · ");

  const maxTotal = Math.max(1, ...trajectory.map((t) => t.total ?? 0));
  const reportedS3 = scope3.filter((c) => c.reported && c.ghg != null);
  const maxS3 = Math.max(1, ...reportedS3.map((c) => c.ghg ?? 0));

  return (
    <div>
      <Link
        href="/scores"
        className="text-sm text-muted-foreground transition hover:text-foreground"
      >
        ← All scores
      </Link>

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
        </div>

        {score != null ? (
          <div className="w-full sm:max-w-xs sm:text-right">
            <div
              className="font-mono text-4xl font-semibold leading-none"
              style={{ color }}
            >
              {formatScore(
                score,
                !!h.score_above_max_location,
                !!h.score_below_min_location,
              )}
              <span className="text-xl"> °C</span>
            </div>
            <div className="mt-3">
              <TemperatureBar
                score={score}
                sectorMedian={h.sector_median_score_location}
                color={color}
              />
            </div>
            {h.sector_median_score_location != null && (
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                Sector avg {h.sector_median_score_location.toFixed(2)}°C
              </p>
            )}
          </div>
        ) : (
          <div className="font-mono text-sm text-muted-foreground">Not yet scored</div>
        )}
      </div>

      {/* Emissions trajectory */}
      <SectionHeading>Emissions trajectory (tCO₂e, market-based)</SectionHeading>
      {trajectory.length === 0 ? (
        <p className="text-sm text-muted-foreground">No trajectory data yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left font-mono text-xs text-muted-foreground">
                <th className="py-2 pr-4 font-normal">Year</th>
                <th className="py-2 pr-4 text-right font-normal">Scope 1</th>
                <th className="py-2 pr-4 text-right font-normal">Scope 2</th>
                <th className="py-2 pr-4 text-right font-normal">Scope 3</th>
                <th className="py-2 pr-4 text-right font-normal">Total</th>
                <th className="hidden w-1/3 py-2 sm:table-cell"></th>
              </tr>
            </thead>
            <tbody>
              {trajectory.map((t) => (
                <tr key={t.year} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-mono">{t.year}</td>
                  <td className="py-2 pr-4 text-right font-mono">{fmt(t.scope1)}</td>
                  <td className="py-2 pr-4 text-right font-mono">{fmt(t.scope2_market)}</td>
                  <td className="py-2 pr-4 text-right font-mono">{fmt(t.scope3)}</td>
                  <td className="py-2 pr-4 text-right font-mono font-medium">{fmt(t.total)}</td>
                  <td className="hidden py-2 sm:table-cell">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${((t.total ?? 0) / maxTotal) * 100}%`,
                        background: color,
                        opacity: 0.55,
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Scope-3 breakdown */}
      {scope3.length > 0 && (
        <>
          <SectionHeading>
            Scope 3 by category{latestYear ? ` · ${latestYear}` : ""}
          </SectionHeading>
          <div className="flex flex-col gap-1.5">
            {scope3.map((c) => (
              <div
                key={c.category}
                className="flex items-center gap-3 text-sm"
                title={c.notes ?? undefined}
              >
                <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">
                  {c.category}
                </span>
                <span
                  className={`w-56 shrink-0 truncate ${
                    c.reported ? "" : "text-muted-foreground/60"
                  }`}
                >
                  {c.name}
                </span>
                <div className="hidden h-2 flex-1 sm:block">
                  {c.reported && c.ghg != null && (
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(c.ghg / maxS3) * 100}%`,
                        background: color,
                        opacity: 0.55,
                      }}
                    />
                  )}
                </div>
                <span className="w-24 shrink-0 text-right font-mono text-xs">
                  {c.reported ? fmt(c.ghg) : <span className="text-muted-foreground/50">not reported</span>}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <>
          <SectionHeading>Sources</SectionHeading>
          <ul className="flex flex-col gap-2 text-sm">
            {sources.map((s) => (
              <li key={s.url} className="flex items-baseline gap-3">
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{s.year}</span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-foreground underline decoration-border underline-offset-4 transition hover:decoration-foreground"
                >
                  {(() => {
                    try {
                      return new URL(s.url).hostname.replace(/^www\./, "");
                    } catch {
                      return s.url;
                    }
                  })()}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
        ThermoStat scores describe a company&apos;s achieved emissions trajectory
        against IPCC AR6 pathways. They are descriptive, not a rating or
        endorsement.{" "}
        <Link href="/methodology" className="underline underline-offset-4">
          How scoring works
        </Link>
        .
      </p>
    </div>
  );
}
