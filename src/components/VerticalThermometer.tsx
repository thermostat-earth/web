import {
  scalePosition,
  scoreColor,
  formatScore,
  SCALE_MIN,
  SCALE_MAX,
} from "@/lib/temperature";

// A vertical thermometer: cool (1.4°C) at the bottom, hot (4.0°C) at the top.
// The company marker sits at its score; a tick shows the sector average.
// When a company is off the scale, the marker sits just beyond the tube end.
export function VerticalThermometer({
  score,
  sectorMedian,
  aboveMax = false,
  belowMin = false,
  height = 140,
  showValue = true,
}: {
  score: number;
  sectorMedian: number | null;
  aboveMax?: boolean;
  belowMin?: boolean;
  height?: number;
  showValue?: boolean;
}) {
  const color = scoreColor(score);
  const pos = aboveMax ? 100 : belowMin ? 0 : scalePosition(score) * 100;
  const markerBottom = aboveMax
    ? "calc(100% + 7px)"
    : belowMin
      ? "-7px"
      : `${pos}%`;
  const sectorPos = sectorMedian != null ? scalePosition(sectorMedian) * 100 : null;

  return (
    <div className="flex items-stretch gap-1.5" style={{ height }}>
      {/* scale labels */}
      <div className="flex flex-col justify-between text-right font-mono text-[10px] text-muted-foreground">
        <span>{SCALE_MAX.toFixed(1)}</span>
        <span>2.7</span>
        <span>{SCALE_MIN.toFixed(1)}</span>
      </div>

      {/* tube */}
      <div
        className="relative w-2.5 rounded-full"
        style={{
          background:
            "linear-gradient(to top, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))",
        }}
      >
        {sectorPos != null && (
          <div
            className="absolute -left-1.5 -right-1.5 h-0.5 bg-foreground/60"
            style={{ bottom: `${sectorPos}%`, transform: "translateY(50%)" }}
          />
        )}
        <div
          className="absolute left-1/2 h-3.5 w-3.5 rounded-full border-2 border-white shadow"
          style={{
            bottom: markerBottom,
            transform: "translate(-50%, 50%)",
            background: color,
          }}
        />
      </div>

      {/* value + sector labels, positioned to match the tube */}
      <div className="relative min-w-[3.2rem] flex-1">
        {showValue && (
          <div
            className="absolute whitespace-nowrap font-mono text-xs font-semibold"
            style={{ bottom: markerBottom, transform: "translateY(50%)", color }}
          >
            {formatScore(score, aboveMax, belowMin)}°C
          </div>
        )}
        {sectorPos != null && (
          <div
            className="absolute whitespace-nowrap font-mono text-[10px] text-muted-foreground"
            style={{ bottom: `${sectorPos}%`, transform: "translateY(50%)" }}
          >
            sector avg
          </div>
        )}
      </div>
    </div>
  );
}
