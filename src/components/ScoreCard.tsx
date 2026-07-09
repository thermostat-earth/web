import { scalePosition, scoreColor, formatScore } from "@/lib/temperature";
import type { CompanyScore } from "@/lib/scores";

const TUBE_GRADIENT =
  "linear-gradient(to top, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))";
const CAP = 24; // reserved space above/below the tube for off-scale dots
const TICKS = [1.4, 2, 3, 4];

export function ScoreCard({ c }: { c: CompanyScore }) {
  const score = c.thermostat_score_location;
  const meta = [c.sector, c.country_hq].filter(Boolean).join(" · ");

  if (score == null) {
    return (
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="text-sm font-medium">{c.company_name}</div>
        <div className="text-xs text-muted-foreground">{meta}</div>
        <div className="mt-3 font-mono text-sm text-muted-foreground">Not yet scored</div>
      </div>
    );
  }

  const color = scoreColor(score);
  const median = c.sector_median_score_location;
  const aboveMax = !!c.score_above_max_location;
  const belowMin = !!c.score_below_min_location;
  const diff = median != null ? score - median : null;
  const vsSector =
    diff == null
      ? null
      : Math.abs(diff) < 0.05
        ? "≈ sector average"
        : `${diff > 0 ? "+" : "−"}${Math.abs(diff).toFixed(2)}°C vs sector`;

  return (
    <div className="flex items-stretch gap-4 rounded-lg border border-border bg-card p-5" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="truncate text-sm font-medium">{c.company_name}</div>
        <div className="truncate text-xs text-muted-foreground">{meta}</div>
        <div className="mt-4 whitespace-nowrap font-mono text-5xl font-semibold leading-none" style={{ color }}>
          {formatScore(score, aboveMax, belowMin).replace(/\s+/g, "")}
          <span className="ml-1 text-xl font-medium">°C</span>
        </div>
        {vsSector && (
          <div className="mt-2.5 text-xs" style={{ color: vsSector.startsWith("≈") ? undefined : color }}>
            {vsSector}
          </div>
        )}
      </div>

      <VerticalThermo score={score} sectorMedian={median} aboveMax={aboveMax} belowMin={belowMin} color={color} />
    </div>
  );
}

function VerticalThermo({
  score,
  sectorMedian,
  aboveMax,
  belowMin,
  color,
}: {
  score: number;
  sectorMedian: number | null;
  aboveMax: boolean;
  belowMin: boolean;
  color: string;
}) {
  const pos = aboveMax ? 100 : belowMin ? 0 : scalePosition(score) * 100;
  const sectorPos = sectorMedian != null ? scalePosition(sectorMedian) * 100 : null;
  const dotBottom = aboveMax ? "calc(100% + 15px)" : belowMin ? "-15px" : `${pos}%`;

  const showArrow = sectorPos != null && Math.abs(pos - sectorPos) > 1;
  const companyAbove = sectorPos != null && pos >= sectorPos;
  const lo = sectorPos != null ? Math.min(pos, sectorPos) : 0;
  const hi = sectorPos != null ? Math.max(pos, sectorPos) : 0;
  const gapPct = hi - lo;

  return (
    <div className="flex shrink-0 items-stretch gap-1.5">
      {/* company-vs-sector arrow (left of the tube, where there's room) */}
      <div className="relative w-2" style={{ paddingTop: CAP, paddingBottom: CAP }}>
        <div className="relative h-full">
          {showArrow && (
            <>
              {/* gap fill: a slim slice of the same gradient as the tube, sector → company */}
              <div className="absolute left-1/2 w-1.5 -translate-x-1/2 overflow-hidden rounded-full" style={{ bottom: `${lo}%`, height: `${gapPct}%` }}>
                <div className="absolute inset-x-0" style={{ height: `${10000 / gapPct}%`, bottom: `${(-lo / gapPct) * 100}%`, background: TUBE_GRADIENT }} />
              </div>
              {/* arrowhead ending at the company marker */}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: `calc(${pos}% - 3px)`,
                  width: 0,
                  height: 0,
                  borderLeft: "4px solid transparent",
                  borderRight: "4px solid transparent",
                  ...(companyAbove ? { borderBottom: `6px solid ${color}` } : { borderTop: `6px solid ${color}` }),
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* tube */}
      <div className="relative w-3" style={{ paddingTop: CAP, paddingBottom: CAP }}>
        <div className="relative h-full w-full rounded-full ring-1 ring-black/10" style={{ background: TUBE_GRADIENT }}>
          {sectorPos != null && (
            <div className="absolute left-1/2 h-[3px] w-6 -translate-x-1/2 translate-y-1/2 rounded-full bg-foreground ring-1 ring-background" style={{ bottom: `${sectorPos}%` }} />
          )}
          <div
            className="absolute left-1/2 h-4 w-4 rounded-full shadow"
            style={{ bottom: dotBottom, transform: "translate(-50%, 50%)", background: color, border: "3px solid hsl(var(--background))" }}
          />
        </div>
      </div>

      {/* scale ticks (outer right, attached to the tube): 1.4 · 2 · 3 · 4 */}
      <div className="relative w-6" style={{ paddingTop: CAP, paddingBottom: CAP }}>
        <div className="relative h-full">
          {TICKS.map((v) => (
            <div key={v} className="absolute left-0 flex translate-y-1/2 items-center gap-0.5" style={{ bottom: `${scalePosition(v) * 100}%` }}>
              <span className="h-px w-1 bg-border" />
              <span className="font-mono text-[9px] leading-none text-muted-foreground">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
