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
  aboveMax = false,
  belowMin = false,
}: {
  score: number;
  sectorMedian: number | null;
  color: string;
  aboveMax?: boolean;
  belowMin?: boolean;
}) {
  // When a company is off the scale, the marker sits just beyond the bar end
  // rather than on it. A small horizontal gap either side leaves room for that.
  const pos = aboveMax ? 100 : belowMin ? 0 : scalePosition(score) * 100;
  const markerTransform = aboveMax
    ? "translate(10px, -50%)"
    : belowMin
      ? "translate(-10px, -50%)"
      : "translate(-50%, -50%)";
  const sectorPos =
    sectorMedian != null ? scalePosition(sectorMedian) * 100 : null;

  return (
    <div className="mt-3">
      <div
        className="relative mx-3 h-2 rounded-full"
        style={{ background: TEMPERATURE_GRADIENT }}
      >
        {sectorPos != null && (
          <div
            className="absolute -top-1 -bottom-1 w-px bg-foreground/40"
            style={{ left: `${sectorPos}%` }}
          />
        )}
        <div
          className="absolute top-1/2 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm"
          style={{ left: `${pos}%`, transform: markerTransform, background: color }}
        />
      </div>
      <div className="mx-3 mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>{SCALE_MIN.toFixed(1)}</span>
        <span>2.7</span>
        <span>{SCALE_MAX.toFixed(1)}</span>
      </div>
    </div>
  );
}
