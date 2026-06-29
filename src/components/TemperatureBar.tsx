import {
  TEMPERATURE_GRADIENT,
  scalePosition,
  SCALE_MIN,
  SCALE_MAX,
} from "@/lib/temperature";

export function TemperatureBar({
  score,
  sectorMedian,
  color,
}: {
  score: number;
  sectorMedian: number | null;
  color: string;
}) {
  const pos = scalePosition(score) * 100;
  const sectorPos =
    sectorMedian != null ? scalePosition(sectorMedian) * 100 : null;
  return (
    <div className="mt-3">
      <div
        className="relative h-2 rounded-full"
        style={{ background: TEMPERATURE_GRADIENT }}
      >
        {sectorPos != null && (
          <div
            className="absolute -top-1 -bottom-1 w-px bg-foreground/40"
            style={{ left: `${sectorPos}%` }}
          />
        )}
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
          style={{ left: `${pos}%`, background: color }}
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>&lt;{SCALE_MIN.toFixed(1)}</span>
        <span>3.0</span>
        <span>&gt;{SCALE_MAX.toFixed(1)}</span>
      </div>
    </div>
  );
}
