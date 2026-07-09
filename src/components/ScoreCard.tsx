import { scalePosition, scoreColor, formatScore } from "@/lib/temperature";
import type { CompanyScore } from "@/lib/scores";

const TUBE_GRADIENT =
  "linear-gradient(to top, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))";
const H = 184; // overall thermometer height (px)
const CAP = 28; // reserved space above/below the tube for off-scale dots
const TUBE_H = H - 2 * CAP; // the coloured tube itself

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
    <div className="flex justify-between gap-3 rounded-lg border border-border bg-card p-5" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="truncate text-sm font-medium">{c.company_name}</div>
        <div className="truncate text-xs text-muted-foreground">{meta}</div>
        <div className="mt-4 font-mono text-5xl font-semibold leading-none" style={{ color }}>
          {formatScore(score, aboveMax, belowMin)}
          <span className="text-xl"> °C</span>
        </div>
        {vsSector && (
          <div className="mt-2 font-mono text-xs" style={{ color: vsSector === "≈ sector average" ? undefined : color }}>
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
  // Off-scale dots sit in the reserved cap above/below the tube — a clear gap from
  // the tube end, and never near the card edge.
  const dotBottom = aboveMax ? "calc(100% + 16px)" : belowMin ? "-16px" : `${pos}%`;

  const showArrow = sectorPos != null && Math.abs(pos - sectorPos) > 1;
  const companyAbove = sectorPos != null && pos >= sectorPos;
  const lo = sectorPos != null ? Math.min(pos, sectorPos) : 0;
  const hi = sectorPos != null ? Math.max(pos, sectorPos) : 0;

  return (
    <div className="flex shrink-0 gap-1.5" style={{ height: H }}>
      {/* scale labels — aligned to the tube (inside the caps) */}
      <div className="flex flex-col justify-between text-right font-mono text-[9px] text-muted-foreground" style={{ paddingTop: CAP - 6, paddingBottom: CAP - 6 }}>
        <span>4.0°C</span>
        <span>2.7</span>
        <span>1.4°C</span>
      </div>

      {/* vertical company-vs-sector arrow (left of the tube, where there's room) */}
      <div className="relative w-3" style={{ paddingTop: CAP, paddingBottom: CAP }}>
        <div className="relative h-full">
          {showArrow && (
            <>
              {/* gap fill: a slice of the same gradient as the tube */}
              <div className="absolute left-1/2 w-1.5 -translate-x-1/2 overflow-hidden rounded-full ring-1 ring-black/5" style={{ bottom: `${lo}%`, height: `${hi - lo}%` }}>
                <div className="absolute inset-x-0" style={{ height: TUBE_H, bottom: `${-(lo / 100) * TUBE_H}px`, background: TUBE_GRADIENT }} />
              </div>
              {/* arrowhead at the company end, pointing toward the company */}
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: `${pos}%`,
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  ...(companyAbove ? { borderBottom: `7px solid ${color}` } : { borderTop: `7px solid ${color}` }),
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* tube (inside the caps) */}
      <div className="relative w-3" style={{ paddingTop: CAP, paddingBottom: CAP }}>
        <div className="relative h-full w-3 rounded-full ring-1 ring-black/10" style={{ background: TUBE_GRADIENT }}>
          {sectorPos != null && (
            <div className="absolute left-1/2 h-[3px] w-6 -translate-x-1/2 translate-y-1/2 rounded-full bg-foreground ring-1 ring-background" style={{ bottom: `${sectorPos}%` }} />
          )}
          <div
            className="absolute left-1/2 h-4 w-4 rounded-full shadow"
            style={{ bottom: dotBottom, transform: "translate(-50%, 50%)", background: color, border: "3px solid hsl(var(--background))" }}
          />
        </div>
      </div>
    </div>
  );
}
