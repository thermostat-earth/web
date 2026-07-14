"use client";

import { useEffect, useState } from "react";
import { scalePosition, scoreColor, formatScore } from "@/lib/temperature";
import type { CompanyScore } from "@/lib/scores";

const H_GRADIENT =
  "linear-gradient(to right, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))";

// A wide temperature scale with the scored companies pinned along it, coolest
// (green) on the left to hottest (red) on the right. Animates in on load.
export function HeroScale({ scores }: { scores: CompanyScore[] }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 60);
    return () => clearTimeout(t);
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
    <div className="relative mt-16">
      {/* soft gradient glow behind the scale */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-48 -translate-y-1/2 opacity-30 blur-3xl"
        style={{ background: H_GRADIENT }}
      />

      <div className="relative py-16">
        <div className="relative">
          {/* the gradient bar (draws in left to right) */}
          <div
            className="h-3 origin-left rounded-full ring-1 ring-white/10"
            style={{
              background: H_GRADIENT,
              transform: shown ? "scaleX(1)" : "scaleX(0)",
              transition: "transform 800ms cubic-bezier(0.16,1,0.3,1)",
            }}
          />

          {/* interior ticks 2 / 3 */}
          {[2, 3].map((v) => (
            <span
              key={v}
              className="absolute top-1/2 h-5 w-px -translate-y-1/2 bg-white/15"
              style={{
                left: `${scalePosition(v) * 100}%`,
                opacity: shown ? 1 : 0,
                transition: "opacity 600ms 450ms",
              }}
            />
          ))}

          {/* end labels */}
          <span className="absolute left-0 top-full mt-2 font-mono text-[11px] text-muted-foreground">
            1.4°C
          </span>
          <span className="absolute right-0 top-full mt-2 font-mono text-[11px] text-muted-foreground">
            4.0°C
          </span>

          {/* company markers + labels */}
          {items.map((it, i) => {
            const above = i % 2 === 1;
            const markerLeft = it.aboveMax
              ? "calc(100% + 12px)"
              : it.belowMin
                ? "-12px"
                : `${it.pos}%`;
            let labelLeft = markerLeft;
            let tX = "-50%";
            if (it.aboveMax || it.pos > 88) {
              labelLeft = "100%";
              tX = "-100%";
            } else if (it.belowMin || it.pos < 12) {
              labelLeft = "0%";
              tX = "0%";
            }
            const delay = 300 + i * 110;
            return (
              <div key={it.s.company_id}>
                {/* connector */}
                <span
                  className="absolute w-px bg-white/25"
                  style={{
                    left: markerLeft,
                    [above ? "bottom" : "top"]: "50%",
                    height: 18,
                    transform: "translateX(-50%)",
                    opacity: shown ? 1 : 0,
                    transition: `opacity 400ms ${delay}ms`,
                  }}
                />
                {/* marker dot */}
                <span
                  className="absolute top-1/2 h-4 w-4 rounded-full shadow"
                  style={{
                    left: markerLeft,
                    transform: "translate(-50%,-50%)",
                    background: it.color,
                    border: "2.5px solid hsl(var(--background))",
                    opacity: shown ? 1 : 0,
                    transition: `opacity 400ms ${delay}ms`,
                  }}
                />
                {/* label */}
                <div
                  className="absolute whitespace-nowrap"
                  style={{
                    left: labelLeft,
                    transform: `translateX(${tX})`,
                    [above ? "bottom" : "top"]: "calc(50% + 22px)",
                    opacity: shown ? 1 : 0,
                    transition: `opacity 500ms ${delay + 90}ms`,
                  }}
                >
                  <div
                    className="font-mono text-sm font-semibold leading-tight"
                    style={{ color: it.color }}
                  >
                    {formatScore(it.score, it.aboveMax, it.belowMin)}°C
                  </div>
                  <div className="text-xs font-medium leading-tight text-foreground">
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
