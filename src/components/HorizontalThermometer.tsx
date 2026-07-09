import { scalePosition, scoreColor, SCALE_MIN, SCALE_MAX } from "@/lib/temperature";

const H_GRADIENT =
  "linear-gradient(to right, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))";

const TICKS = [1.4, 2, 3, 4];

// Edge-aware anchoring: right-align near the right edge, left-align near the
// left edge, otherwise centre — so labels never overflow the ends.
function anchor(p: number): React.CSSProperties {
  if (p <= 12) return { left: `${p}%`, textAlign: "left" };
  if (p >= 88) return { right: `${100 - p}%`, textAlign: "right" };
  return { left: `${p}%`, transform: "translateX(-50%)", textAlign: "center" };
}

function TriDown({ color }: { color: string }) {
  return (
    <span style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `6px solid ${color}`, display: "block" }} />
  );
}

// Full-width horizontal thermometer: cool (1.4°C) left → hot (4.0°C) right.
export function HorizontalThermometer({
  score,
  sectorMedian,
  companyName,
  aboveMax = false,
  belowMin = false,
}: {
  score: number;
  sectorMedian: number | null;
  companyName: string;
  aboveMax?: boolean;
  belowMin?: boolean;
}) {
  const color = scoreColor(score);
  const pos = aboveMax ? 100 : belowMin ? 0 : scalePosition(score) * 100;
  const sectorPos = sectorMedian != null ? scalePosition(sectorMedian) * 100 : null;

  // marker centres (company sits off the end when clamped)
  const companyCenter = aboveMax ? "calc(100% + 16px)" : belowMin ? "-16px" : `${pos}%`;

  // gap fill: cool colour → warm colour across the company↔sector span
  const gap =
    sectorMedian != null
      ? { lo: Math.min(pos, sectorPos!), hi: Math.max(pos, sectorPos!), grad: `linear-gradient(to right, ${scoreColor(Math.min(score, sectorMedian))}, ${scoreColor(Math.max(score, sectorMedian))})` }
      : null;

  return (
    <div className="mt-8">
      {/* labels + arrows above (same side) */}
      <div className="relative mb-1 h-9">
        <div className="absolute top-0 whitespace-nowrap text-xs font-medium" style={{ ...anchor(pos), color }}>{companyName}</div>
        <div className="absolute bottom-0 -translate-x-1/2" style={{ left: companyCenter }}><TriDown color={color} /></div>
        {sectorPos != null && (
          <>
            <div className="absolute top-0 whitespace-nowrap text-xs text-muted-foreground" style={anchor(sectorPos)}>sector average</div>
            <div className="absolute bottom-0 -translate-x-1/2" style={{ left: `${sectorPos}%` }}><TriDown color="hsl(var(--foreground))" /></div>
          </>
        )}
      </div>

      {/* main track */}
      <div className="relative h-3 rounded-full ring-1 ring-black/10" style={{ background: H_GRADIENT }}>
        {sectorPos != null && (
          <div className="absolute top-1/2 h-5 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-1 ring-background" style={{ left: `${sectorPos}%` }} />
        )}
        <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow" style={{ left: companyCenter, background: color, border: "3px solid hsl(var(--background))" }} />
      </div>

      {/* degree tick marks */}
      <div className="relative mt-1.5 h-5">
        {TICKS.map((t) => {
          const p = scalePosition(t) * 100;
          return (
            <div key={t} className="absolute flex flex-col" style={anchor(p)}>
              <span className="h-1.5 w-px bg-muted-foreground/40" style={{ alignSelf: p <= 12 ? "flex-start" : p >= 88 ? "flex-end" : "center" }} />
              <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">{t}</span>
            </div>
          );
        })}
      </div>

      {/* gap bar — coloured to show direction vs sector */}
      {gap && gap.hi - gap.lo > 0.5 && (
        <div className="relative mt-2 h-2">
          <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-border" />
          <div className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full ring-1 ring-black/10" style={{ left: `${gap.lo}%`, width: `${gap.hi - gap.lo}%`, background: gap.grad }} />
        </div>
      )}
    </div>
  );
}
