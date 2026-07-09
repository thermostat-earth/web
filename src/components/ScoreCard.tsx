import { scalePosition, scoreColor, formatScore } from "@/lib/temperature";
import type { CompanyScore } from "@/lib/scores";

const H_GRADIENT =
  "linear-gradient(to right, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))";

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
    <div className="rounded-lg border border-border bg-card p-5" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{c.company_name}</div>
          <div className="text-xs text-muted-foreground">{meta}</div>
        </div>
        <div className="shrink-0 font-mono text-3xl font-semibold leading-none" style={{ color }}>
          {formatScore(score, aboveMax, belowMin)}
          <span className="text-base"> °C</span>
        </div>
      </div>

      {vsSector && (
        <div className="mt-1 text-right font-mono text-xs" style={{ color: vsSector === "≈ sector average" ? undefined : color }}>
          {vsSector}
        </div>
      )}

      <MiniThermo score={score} sectorMedian={median} aboveMax={aboveMax} belowMin={belowMin} color={color} />
    </div>
  );
}

function MiniThermo({
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
  // Clamped dots sit off the bar end (with a gap) but inside the card padding.
  const companyLeft = aboveMax ? "calc(100% + 8px)" : belowMin ? "-8px" : `${pos}%`;
  const gap =
    sectorPos != null && Math.abs(pos - sectorPos) > 1
      ? {
          companyRight: pos >= sectorPos,
          leftEnd: pos >= sectorPos ? `${sectorPos}%` : companyLeft,
          rightEnd: pos >= sectorPos ? companyLeft : `${sectorPos}%`,
        }
      : null;

  return (
    <div className="mt-4 px-4">
      <div className="relative h-2 rounded-full ring-1 ring-black/10" style={{ background: H_GRADIENT }}>
        {sectorPos != null && (
          <div className="absolute top-1/2 h-3.5 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-1 ring-background" style={{ left: `${sectorPos}%` }} />
        )}
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow"
          style={{ left: companyLeft, background: color, border: "2px solid hsl(var(--background))" }}
        />
      </div>

      {gap && (
        <div className="relative mt-1.5 h-2">
          <div className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full" style={{ left: gap.leftEnd, right: `calc(100% - (${gap.rightEnd}))`, background: color, opacity: 0.55 }} />
          {gap.companyRight ? (
            <span className="absolute top-1/2" style={{ left: gap.rightEnd, transform: "translate(-100%,-50%)", width: 0, height: 0, borderTop: "4px solid transparent", borderBottom: "4px solid transparent", borderLeft: `6px solid ${color}` }} />
          ) : (
            <span className="absolute top-1/2" style={{ left: gap.leftEnd, transform: "translateY(-50%)", width: 0, height: 0, borderTop: "4px solid transparent", borderBottom: "4px solid transparent", borderRight: `6px solid ${color}` }} />
          )}
        </div>
      )}

      <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
        <span>1.4°C</span>
        <span>4.0°C</span>
      </div>
    </div>
  );
}
