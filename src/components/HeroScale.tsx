"use client";

import { useEffect, useState } from "react";
import { scalePosition, scoreColor, formatScore } from "@/lib/temperature";
import type { CompanyScore } from "@/lib/scores";

const H_GRADIENT =
  "linear-gradient(to right, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))";
const TICKS = [1.4, 2, 3, 4];

// A wide temperature scale with the scored companies pinned along it, coolest
// (green, left) to hottest (red, right). Ruler sits below the bar; company
// labels stack above it, staggered so clusters don't collide. Hovering a
// company dims the rest. Animates in on load.
export function HeroScale({ scores }: { scores: CompanyScore[] }) {
  const [barIn, setBarIn] = useState(false);
  const [dotsIn, setDotsIn] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  useEffect(() => {
    const t1 = setTimeout(() => setBarIn(true), 60);
    const t2 = setTimeout(() => setDotsIn(true), 560);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const items = scores
    .filter((s) => s.thermostat_score_location != null)
    .map((s) => {
      const score = s.thermostat_score_location as number;
      const aboveMax = !!s.score_above_max_location;
      const belowMin = !!s.score_below_min_location;
      const pos = aboveMax ? 100 : belowMin ? 0 : scalePosition(score) * 100;
      return { s, score, aboveMax, belowMin, pos, color: scoreColor(score) };
    })
    .sort((a, b) => a.pos - b.pos);

  return (
    <div className="relative mt-12">
      {/* soft gradient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-56 -translate-y-1/2 opacity-30 blur-3xl"
        style={{ background: H_GRADIENT }}
      />

      {/* room above for stacked labels, below for the ruler */}
      <div className="relative pb-14 pt-36">
        {/* inset so off-scale markers + labels have room on both sides */}
        <div className="relative mx-6 sm:mx-16">
          {/* the gradient bar (draws in left to right) */}
          <div
            className="h-3 origin-left rounded-full ring-1 ring-white/10"
            style={{
              background: H_GRADIENT,
              transform: barIn ? "scaleX(1)" : "scaleX(0)",
              transition: "transform 800ms cubic-bezier(0.16,1,0.3,1)",
            }}
          />

          {/* interior tick marks on the bar */}
          {[2, 3].map((v) => (
            <span
              key={v}
              className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-white/20"
              style={{
                left: `${scalePosition(v) * 100}%`,
                opacity: dotsIn ? 1 : 0,
                transition: "opacity 400ms",
              }}
            />
          ))}

          {/* scale ruler below: 1.4 / 2 / 3 / 4 °C */}
          {TICKS.map((v, idx) => {
            const p = scalePosition(v) * 100;
            const anchor: React.CSSProperties =
              idx === 0
                ? { left: 0 }
                : idx === TICKS.length - 1
                  ? { right: 0 }
                  : { left: `${p}%`, transform: "translateX(-50%)" };
            return (
              <span
                key={v}
                className="absolute top-full mt-3 font-mono text-[11px] text-muted-foreground"
                style={{ ...anchor, opacity: dotsIn ? 1 : 0, transition: "opacity 400ms" }}
              >
                {v.toFixed(1)}°C
              </span>
            );
          })}

          {/* company markers + stacked labels */}
          {items.map((it, i) => {
            const row = i % 2; // 0 = near bar, 1 = higher — separates clusters
            const dim = hovered != null && hovered !== it.s.company_id;
            const markerLeft = it.aboveMax
              ? "calc(100% + 12px)"
              : it.belowMin
                ? "-12px"
                : `${it.pos}%`;
            let labelLeft = markerLeft;
            let tX = "-50%";
            let textAlign: "left" | "center" | "right" = "center";
            if (it.aboveMax || it.pos > 85) {
              labelLeft = "100%";
              tX = "-100%";
              textAlign = "right";
            } else if (it.belowMin || it.pos < 15) {
              labelLeft = "0%";
              tX = "0%";
              textAlign = "left";
            }
            const conn = row === 0 ? 34 : 88;
            const onEnter = () => setHovered(it.s.company_id);
            const onLeave = () => setHovered(null);
            return (
              <div key={it.s.company_id}>
                {/* connector */}
                <span
                  className="absolute w-px bg-white/25"
                  style={{
                    left: markerLeft,
                    bottom: "50%",
                    height: conn,
                    transform: "translateX(-50%)",
                    opacity: !dotsIn ? 0 : dim ? 0.1 : 1,
                    transition: "opacity 250ms",
                  }}
                />
                {/* marker dot */}
                <span
                  onMouseEnter={onEnter}
                  onMouseLeave={onLeave}
                  className="absolute top-1/2 h-4 w-4 cursor-default rounded-full shadow"
                  style={{
                    left: markerLeft,
                    transform: "translate(-50%,-50%)",
                    background: it.color,
                    border: "2.5px solid hsl(var(--background))",
                    opacity: !dotsIn ? 0 : dim ? 0.18 : 1,
                    transition: "opacity 250ms",
                  }}
                />
                {/* label */}
                <div
                  onMouseEnter={onEnter}
                  onMouseLeave={onLeave}
                  className="absolute cursor-default whitespace-nowrap"
                  style={{
                    left: labelLeft,
                    bottom: `calc(50% + ${conn}px)`,
                    transform: `translateX(${tX})`,
                    textAlign,
                    opacity: !dotsIn ? 0 : dim ? 0.3 : 1,
                    transition: "opacity 250ms",
                  }}
                >
                  <div
                    className="font-mono text-sm font-semibold leading-tight"
                    style={{ color: dim ? "hsl(var(--muted-foreground))" : it.color }}
                  >
                    {formatScore(it.score, it.aboveMax, it.belowMin)}°C
                  </div>
                  <div
                    className="text-xs font-medium leading-tight"
                    style={{
                      color: dim
                        ? "hsl(var(--muted-foreground))"
                        : "hsl(var(--foreground))",
                    }}
                  >
                    {it.s.company_name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
