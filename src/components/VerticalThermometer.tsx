import { scalePosition, scoreColor, SCALE_MIN, SCALE_MAX } from "@/lib/temperature";

// A vertical thermometer: cool (1.4°C) at the bottom, hot (4.0°C) at the top.
// The company sits as a coloured dot; the sector average as a distinct bar.
// When a company is off the scale, its dot sits clearly beyond the tube end.
export function VerticalThermometer({
  score,
  sectorMedian,
  aboveMax = false,
  belowMin = false,
  height = 150,
  showLegend = true,
}: {
  score: number;
  sectorMedian: number | null;
  aboveMax?: boolean;
  belowMin?: boolean;
  height?: number;
  showLegend?: boolean;
}) {
  const color = scoreColor(score);
  const pos = aboveMax ? 100 : belowMin ? 0 : scalePosition(score) * 100;
  const sectorPos = sectorMedian != null ? scalePosition(sectorMedian) * 100 : null;

  const markerStyle: React.CSSProperties = aboveMax
    ? { bottom: "calc(100% + 8px)", transform: "translate(-50%, 0)" }
    : belowMin
      ? { bottom: "-24px", transform: "translate(-50%, 0)" }
      : { bottom: `${pos}%`, transform: "translate(-50%, 50%)" };

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="flex gap-2" style={{ height }}>
        {/* scale labels */}
        <div className="flex flex-col justify-between py-[3px] text-right font-mono text-[10px] text-muted-foreground">
          <span>{SCALE_MAX.toFixed(1)}</span>
          <span>2.7</span>
          <span>{SCALE_MIN.toFixed(1)}</span>
        </div>

        {/* tube */}
        <div
          className="relative w-3 rounded-full ring-1 ring-black/10"
          style={{
            background:
              "linear-gradient(to top, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))",
          }}
        >
          {/* sector average — a distinct bar across the tube */}
          {sectorPos != null && (
            <div
              className="absolute left-1/2 h-[3px] w-6 -translate-x-1/2 translate-y-1/2 rounded-full bg-foreground shadow-sm ring-1 ring-background"
              style={{ bottom: `${sectorPos}%` }}
            />
          )}
          {/* company — a coloured dot */}
          <div
            className="absolute left-1/2 h-4 w-4 rounded-full shadow"
            style={{ ...markerStyle, background: color, border: "3px solid hsl(var(--background))" }}
          />
        </div>
      </div>

      {showLegend && (
        <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color, border: "2px solid hsl(var(--background))" }} />
            this company
          </span>
          {sectorPos != null && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-[3px] w-3.5 rounded-full bg-foreground" />
              sector average
            </span>
          )}
        </div>
      )}
    </div>
  );
}
