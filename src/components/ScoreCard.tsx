import { scalePosition, scoreColor, formatScore } from "@/lib/temperature";
import type { CompanyScore } from "@/lib/scores";
import { unscoredLabel } from "@/lib/unknown-reason";
import { completenessCount, type Completeness } from "@/lib/completeness";

const TUBE_GRADIENT =
  "linear-gradient(to top, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))";
const TICKS = [1.4, 2, 3, 4];

export function ScoreCard({
  c,
  soloSector = false,
  completeness,
}: {
  c: CompanyScore;
  soloSector?: boolean;
  completeness?: Completeness;
}) {
  // WHICHEVER BASIS THIS COMPANY ACTUALLY HAS. A basis counts only if it is present in every year
  // of the window, so a company can hold a market-based score and no location-based one. This card
  // read the location score alone, so Apple, Amazon, Nike and Foxconn rendered as "Not yet scored"
  // while holding real numbers — the same mistake as the unscoredLabel note above, made one level
  // up. Location is shown where both exist, because it is the basis that does not move with a
  // company's electricity contracts; where only market exists it is shown AND NAMED, since a
  // market-based figure presented as if it were location-based is the misleading half of this.
  const useMarket = c.thermostat_score_location == null && c.thermostat_score_market != null;
  const score = useMarket ? c.thermostat_score_market : c.thermostat_score_location;
  const meta = [c.sector, c.country_hq].filter(Boolean).join(" · ");

  if (score == null) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="text-sm font-medium">{c.company_name}</div>
        <div className="text-xs text-muted-foreground">{meta}</div>
        <div className="mt-3 font-mono text-sm text-muted-foreground">{unscoredLabel(c.unknown_reason)}</div>
      </div>
    );
  }

  const color = scoreColor(score);
  // Solo sector → no meaningful average; drop the comparison visual + swap the label.
  const median = soloSector ? null
    : useMarket ? c.sector_median_score_market : c.sector_median_score_location;
  const aboveMax = useMarket ? !!c.score_above_max_market : !!c.score_above_max_location;
  const belowMin = useMarket ? !!c.score_below_min_market : !!c.score_below_min_location;
  const diff = median != null ? score - median : null;
  const approx = diff != null && Math.abs(diff) < 0.05;
  const vsSector = soloSector
    ? "Only company in this sector so far"
    : diff == null
      ? null
      : approx
        ? "≈ sector average"
        : `${diff > 0 ? "+" : "−"}${Math.abs(diff).toFixed(2)}°C vs sector`;

  return (
    <div className="flex items-stretch justify-between gap-4 rounded-lg border border-border bg-card px-6 py-8" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex min-w-0 flex-col">
        <div className="truncate text-sm font-medium">{c.company_name}</div>
        <div className="truncate text-xs text-muted-foreground">{meta}</div>
        <div className="mt-4 whitespace-nowrap font-mono text-6xl font-semibold leading-none" style={{ color }}>
          {formatScore(score, aboveMax, belowMin).replace(/\s+/g, "")}
          <span className="ml-1 text-2xl font-medium">°C</span>
        </div>
        {useMarket && (
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">market-based</div>
        )}
        <CoverageTag completeness={completeness} />
        {vsSector && (
          <div className="mt-2.5 text-xs" style={{ color: approx || soloSector ? undefined : color }}>
            {vsSector}
          </div>
        )}
      </div>

      <VerticalThermo
        score={score}
        sectorMedian={median}
        aboveMax={aboveMax}
        belowMin={belowMin}
        approxSector={approx}
        color={color}
      />
    </div>
  );
}

/**
 * What the score rests on, stated next to the score rather than buried on the detail page.
 *
 * A count, not a percentage, and not a bar: "12 of 14 lines reported". A bar or a percentage
 * invites the reader to treat 86% as nearly-complete, when the missing line might be the largest
 * part of the company's footprint — which is precisely the thing we cannot know, because they did
 * not report it. The count says what is true and leaves the weighing to the detail page, where the
 * sector share for each missing category is given.
 */
function CoverageTag({ completeness }: { completeness?: Completeness }) {
  if (!completeness) return null;
  const complete = completeness.completeness_tag === "complete";
  return (
    <div className="mt-2.5 flex items-center gap-1.5 text-xs">
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
          complete
            ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
            : "bg-amber-500/12 text-amber-700 dark:text-amber-500"
        }`}
      >
        {complete ? "Complete" : "Incomplete"}
      </span>
      <span className="text-muted-foreground">{completenessCount(completeness)} lines reported</span>
    </div>
  );
}

function VerticalThermo({
  score,
  sectorMedian,
  aboveMax,
  belowMin,
  approxSector,
  color,
}: {
  score: number;
  sectorMedian: number | null;
  aboveMax: boolean;
  belowMin: boolean;
  approxSector: boolean;
  color: string;
}) {
  const pos = aboveMax ? 100 : belowMin ? 0 : scalePosition(score) * 100;
  const sectorPos = sectorMedian != null ? scalePosition(sectorMedian) * 100 : null;
  // Off-scale dots sit just clear of the tube end (small gap, not floating high).
  const dotBottom = aboveMax ? "calc(100% + 13px)" : belowMin ? "-13px" : `${pos}%`;
  // When company ≈ sector, the sector line snaps to the company dot (incl. off-scale).
  const sectorBottom = sectorPos == null ? null : approxSector ? dotBottom : `${sectorPos}%`;
  // Rule: the arrowhead is vertically centred on the company circle (9px tall → offset half).
  const headBottom = aboveMax ? "calc(100% + 8.5px)" : belowMin ? "-17.5px" : `calc(${pos}% - 4.5px)`;

  const showArrow = !approxSector && sectorPos != null && Math.abs(pos - sectorPos) > 1;
  const companyAbove = sectorPos != null && pos >= sectorPos;
  const lo = sectorPos != null ? Math.min(pos, sectorPos) : 0;
  const hi = sectorPos != null ? Math.max(pos, sectorPos) : 0;
  const gapPct = hi - lo;

  return (
    <div className="flex shrink-0 flex-col items-end">
      {/* key (top-right) — h-5 matches the company-name line so they align vertically */}
      <div className="mb-6 flex h-5 items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color, border: "2px solid hsl(var(--background))" }} />
          This company
        </span>
        {sectorPos != null && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[3px] w-3.5 rounded-full bg-foreground" />
            Sector average
          </span>
        )}
      </div>

      <div className="flex flex-1 items-stretch">
      {/* company-vs-sector arrow — thin shaft, chunky head, set a little apart from the tube */}
      <div className="relative mr-2.5 w-2">
        <div className="relative h-full">
          {showArrow && (
            <>
              <div className="absolute left-1/2 w-1 -translate-x-1/2 overflow-hidden rounded-full" style={{ bottom: `${lo}%`, height: `${gapPct}%` }}>
                <div className="absolute inset-x-0" style={{ height: `${10000 / gapPct}%`, bottom: `${(-lo / gapPct) * 100}%`, background: TUBE_GRADIENT }} />
              </div>
              {/* off-scale: bridge the tube end up/down to the centred arrowhead so the line stays joined */}
              {aboveMax && (
                <div className="absolute left-1/2 w-1 -translate-x-1/2" style={{ bottom: "100%", height: "8.5px", background: "hsl(0 72% 51%)" }} />
              )}
              {belowMin && (
                <div className="absolute left-1/2 w-1 -translate-x-1/2" style={{ top: "100%", height: "8.5px", background: "hsl(145 60% 42%)" }} />
              )}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: headBottom,
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  ...(companyAbove ? { borderBottom: `9px solid ${color}` } : { borderTop: `9px solid ${color}` }),
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* tube — top aligns with the company name, bottom with the vs-sector line */}
      <div className="relative mr-2 w-3">
        <div className="relative h-full w-full rounded-full ring-1 ring-black/10" style={{ background: TUBE_GRADIENT }}>
          {sectorBottom != null && (
            <div className="absolute left-1/2 h-[3px] w-6 -translate-x-1/2 translate-y-1/2 rounded-full bg-foreground ring-1 ring-background" style={{ bottom: sectorBottom }} />
          )}
          <div
            className="absolute left-1/2 h-4 w-4 rounded-full shadow"
            style={{ bottom: dotBottom, transform: "translate(-50%, 50%)", background: color, border: "3px solid hsl(var(--background))" }}
          />
        </div>
      </div>

      {/* scale ticks (outer): 1.4°C · 2°C · 3°C · 4°C */}
      <div className="relative w-9">
        <div className="relative h-full">
          {TICKS.map((v) => (
            <div key={v} className="absolute left-0 flex translate-y-1/2 items-center gap-0.5" style={{ bottom: `${scalePosition(v) * 100}%` }}>
              <span className="h-px w-1 bg-border" />
              <span className="font-mono text-[9px] leading-none text-muted-foreground">{v}°C</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
