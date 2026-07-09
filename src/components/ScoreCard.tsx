import { scalePosition, scoreColor, formatScore } from "@/lib/temperature";
import type { CompanyScore } from "@/lib/scores";

const TUBE_GRADIENT =
  "linear-gradient(to top, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))";

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
    <div className="flex justify-between gap-4 rounded-lg border border-border bg-card p-5" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="truncate text-sm font-medium">{c.company_name}</div>
        <div className="truncate text-xs text-muted-foreground">{meta}</div>
        <div className="mt-auto pt-4">
          <div className="font-mono text-4xl font-semibold leading-none" style={{ color }}>
            {formatScore(score, aboveMax, belowMin)}
            <span className="text-lg"> °C</span>
          </div>
          {vsSector && (
            <div className="mt-1.5 font-mono text-xs" style={{ color: vsSector === "≈ sector average" ? undefined : color }}>
              {vsSector}
            </div>
          )}
        </div>
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
  const H = 156;
  const pos = aboveMax ? 100 : belowMin ? 0 : scalePosition(score) * 100;
  const sectorPos = sectorMedian != null ? scalePosition(sectorMedian) * 100 : null;
  // Clamped dots sit off the tube end (with a gap) but inside the card padding.
  const dotBottom = aboveMax ? "calc(100% + 10px)" : belowMin ? "-10px" : `${pos}%`;

  const showArrow = sectorPos != null && Math.abs(pos - sectorPos) > 1;
  const companyAbove = sectorPos != null && pos >= sectorPos;
  const lo = sectorPos != null ? Math.min(pos, sectorPos) : 0;
  const hi = sectorPos != null ? Math.max(pos, sectorPos) : 0;

  return (
    <div className="flex shrink-0 gap-2" style={{ height: H }}>
      {/* scale labels */}
      <div className="flex flex-col justify-between py-[3px] text-right font-mono text-[9px] text-muted-foreground">
        <span>4.0°C</span>
        <span>2.7</span>
        <span>1.4°C</span>
      </div>

      {/* tube */}
      <div className="relative w-3 rounded-full ring-1 ring-black/10" style={{ background: TUBE_GRADIENT }}>
        {sectorPos != null && (
          <div className="absolute left-1/2 h-[3px] w-6 -translate-x-1/2 translate-y-1/2 rounded-full bg-foreground ring-1 ring-background" style={{ bottom: `${sectorPos}%` }} />
        )}
        <div
          className="absolute left-1/2 h-4 w-4 rounded-full shadow"
          style={{ bottom: dotBottom, transform: "translate(-50%, 50%)", background: color, border: "3px solid hsl(var(--background))" }}
        />
      </div>

      {/* vertical company-vs-sector arrow */}
      <div className="relative w-2.5">
        {showArrow && (
          <>
            <div className="absolute left-1/2 w-[3px] -translate-x-1/2 rounded-full" style={{ bottom: `${lo}%`, height: `${hi - lo}%`, background: color, opacity: 0.55 }} />
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                bottom: `${pos}%`,
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
  );
}
