"use client";

import { useEffect, useRef, useState } from "react";
import { scalePosition, scoreColor } from "@/lib/temperature";

const H_GRADIENT =
  "linear-gradient(to right, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))";

const TICKS = [1.4, 2, 3, 4];

type Align = "left" | "center" | "right";

function styleFor(p: number, align: Align): React.CSSProperties {
  if (align === "left") return { left: `${p}%`, textAlign: "left" };
  if (align === "right") return { right: `${100 - p}%`, textAlign: "right" };
  return { left: `${p}%`, transform: "translateX(-50%)", textAlign: "center" };
}

// Same, but anchored to a CSS position (so it can align to an off-the-bar dot).
function styleForCSS(leftCSS: string, align: Align): React.CSSProperties {
  const HALF = 8; // half the company dot, so the label edge meets the dot edge
  if (align === "left") return { left: `calc((${leftCSS}) - ${HALF}px)`, textAlign: "left" };
  if (align === "right") return { right: `calc(100% - (${leftCSS}) - ${HALF}px)`, textAlign: "right" };
  return { left: leftCSS, transform: "translateX(-50%)", textAlign: "center" };
}

function TriDown({ color }: { color: string }) {
  return <span style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `6px solid ${color}`, display: "block" }} />;
}

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
  const companyCenter = aboveMax ? "calc(100% + 16px)" : belowMin ? "-16px" : `${pos}%`;
  // When company and sector coincide (e.g. the only company in its sector), merge
  // the two labels so they don't pile up on top of each other.
  const coincident = sectorPos != null && Math.abs(pos - sectorPos) < 3;
  const exact = sectorPos != null && Math.abs(pos - sectorPos) < 0.5;

  // Measure the track + labels so a label only centres when it actually fits;
  // otherwise it anchors to the nearer end.
  const trackRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);
  const sectorRef = useRef<HTMLDivElement>(null);
  const [align, setAlign] = useState<{ company: Align; sector: Align }>({ company: "center", sector: "center" });

  useEffect(() => {
    const compute = (p: number, w: number, W: number): Align => {
      const c = (p / 100) * W;
      if (c - w / 2 < 0) return "left";
      if (c + w / 2 > W) return "right";
      return "center";
    };
    const recompute = () => {
      const W = trackRef.current?.offsetWidth ?? 0;
      if (!W) return;
      setAlign({
        company: compute(pos, companyRef.current?.offsetWidth ?? 0, W),
        sector: sectorPos != null ? compute(sectorPos, sectorRef.current?.offsetWidth ?? 0, W) : "center",
      });
    };
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [pos, sectorPos]);

  // Gap between company and sector. Endpoints are CSS values so the company end
  // reaches the dot even when it sits off the bar (clamped >4.0 / <1.4).
  const gap = (() => {
    if (sectorMedian == null || coincident) return null;
    const companyRight = pos >= sectorPos!;
    return {
      companyRight,
      leftEnd: companyRight ? `${sectorPos}%` : companyCenter,
      rightEnd: companyRight ? companyCenter : `${sectorPos}%`,
      grad: `linear-gradient(to right, ${scoreColor(Math.min(score, sectorMedian))}, ${scoreColor(Math.max(score, sectorMedian))})`,
    };
  })();

  return (
    <div className="mt-8">
      {/* difference arrow (company vs sector), sitting above the markers. An
          arrow pointing OUT to the company, flush against its end. */}
      {gap && (
        <div className="relative mb-1.5 h-3">
          <div className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full" style={{ left: gap.leftEnd, right: `calc(100% - (${gap.rightEnd}))`, background: gap.grad }} />
          {gap.companyRight ? (
            <span className="absolute top-1/2" style={{ left: gap.rightEnd, transform: "translate(-1px, -50%)", width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderLeft: `9px solid ${color}` }} />
          ) : (
            <span className="absolute top-1/2" style={{ left: gap.leftEnd, transform: "translate(calc(-100% + 1px), -50%)", width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: `9px solid ${color}` }} />
          )}
        </div>
      )}

      {/* labels + arrows above */}
      <div className="relative mb-2 h-8">
        <div ref={companyRef} className="absolute top-0 whitespace-nowrap text-xs font-medium" style={{ ...styleForCSS(companyCenter, align.company), color }}>
          {companyName}
          {coincident && <span className="font-normal text-muted-foreground"> · {exact ? "=" : "≈"} Sector average</span>}
        </div>
        <div className="absolute bottom-0 -translate-x-1/2" style={{ left: companyCenter }}><TriDown color={color} /></div>
        {sectorPos != null && !coincident && (
          <>
            <div ref={sectorRef} className="absolute top-0 whitespace-nowrap text-xs text-muted-foreground" style={styleFor(sectorPos, align.sector)}>
              Sector average
            </div>
            <div className="absolute bottom-0 -translate-x-1/2" style={{ left: `${sectorPos}%` }}><TriDown color="hsl(var(--foreground))" /></div>
          </>
        )}
      </div>

      {/* main track */}
      <div ref={trackRef} className="relative h-3 rounded-full ring-1 ring-black/10" style={{ background: H_GRADIENT }}>
        {sectorPos != null && (
          <div className="absolute top-1/2 h-5 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-1 ring-background" style={{ left: `${sectorPos}%` }} />
        )}
        <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow" style={{ left: companyCenter, background: color, border: "3px solid hsl(var(--background))" }} />
      </div>

      {/* degree ticks */}
      <div className="relative mt-1.5 h-5">
        {TICKS.map((t) => {
          const p = scalePosition(t) * 100;
          const a: Align = p <= 1 ? "left" : p >= 99 ? "right" : "center";
          return (
            <div key={t} className="absolute flex flex-col" style={{ ...styleFor(p, a), alignItems: a === "left" ? "flex-start" : a === "right" ? "flex-end" : "center" }}>
              <span className="h-1.5 w-px bg-muted-foreground/40" />
              <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">{t}°C</span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
