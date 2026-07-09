import { scalePosition, scoreColor, SCALE_MIN, SCALE_MAX } from "@/lib/temperature";

const H_GRADIENT =
  "linear-gradient(to right, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))";

function TriDown({ color }: { color: string }) {
  return (
    <span
      style={{
        width: 0,
        height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderTop: `6px solid ${color}`,
        display: "block",
      }}
    />
  );
}

// Full-width horizontal thermometer: cool (1.4°C) left → hot (4.0°C) right.
// Company + sector arrows sit on the same side (above). The gap between them is
// shown as a separate visible bar below the main track.
export function HorizontalThermometer({
  score,
  sectorMedian,
  aboveMax = false,
  belowMin = false,
}: {
  score: number;
  sectorMedian: number | null;
  aboveMax?: boolean;
  belowMin?: boolean;
}) {
  const color = scoreColor(score);
  const pos = aboveMax ? 100 : belowMin ? 0 : scalePosition(score) * 100;
  const sectorPos = sectorMedian != null ? scalePosition(sectorMedian) * 100 : null;
  const gapLo = sectorPos != null ? Math.min(pos, sectorPos) : null;
  const gapHi = sectorPos != null ? Math.max(pos, sectorPos) : null;

  const companyLeft = aboveMax ? "calc(100% + 12px)" : belowMin ? "-12px" : `${pos}%`;
  const companyTransform = aboveMax
    ? "translate(0, -50%)"
    : belowMin
      ? "translate(-100%, -50%)"
      : "translate(-50%, -50%)";

  return (
    <div className="mt-8">
      {/* arrows, same side (above the bar) */}
      <div className="relative mb-1.5 h-2">
        <div className="absolute -translate-x-1/2" style={{ left: companyLeft }}>
          <TriDown color={color} />
        </div>
        {sectorPos != null && (
          <div className="absolute -translate-x-1/2" style={{ left: `${sectorPos}%` }}>
            <TriDown color="hsl(var(--foreground))" />
          </div>
        )}
      </div>

      {/* main track */}
      <div className="relative h-3 rounded-full ring-1 ring-black/10" style={{ background: H_GRADIENT }}>
        {sectorPos != null && (
          <div className="absolute top-1/2 h-5 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-1 ring-background" style={{ left: `${sectorPos}%` }} />
        )}
        <div
          className="absolute top-1/2 h-4 w-4 rounded-full shadow"
          style={{ left: companyLeft, transform: companyTransform, background: color, border: "3px solid hsl(var(--background))" }}
        />
      </div>

      {/* gap bar below — a visible segment spanning company↔sector */}
      {gapLo != null && gapHi != null && (
        <div className="relative mt-2.5 h-1.5">
          <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-border" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-foreground/60"
            style={{ left: `${gapLo}%`, width: `${gapHi - gapLo}%` }}
          />
        </div>
      )}

      {/* key + scale */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color, border: "2px solid hsl(var(--background))" }} /> this company
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-[3px] rounded-full bg-foreground" /> sector average
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-3.5 rounded-full bg-foreground/60" /> gap vs sector
          </span>
        </div>
        <div className="flex gap-3 font-mono text-[10px] text-muted-foreground">
          <span>{SCALE_MIN.toFixed(1)}°C</span>
          <span>→</span>
          <span>{SCALE_MAX.toFixed(1)}°C</span>
        </div>
      </div>
    </div>
  );
}
