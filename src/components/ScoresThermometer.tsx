"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { scalePosition, scoreColor, formatScore } from "@/lib/temperature";
import type { CompanyScore } from "@/lib/scores";

const H = 620; // thermometer height in px
const LABEL_GAP = 34; // min vertical spacing between labels

const TUBE_GRADIENT =
  "linear-gradient(to top, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))";
const TICKS = [1.4, 2, 3, 4];

export function ScoresThermometer({ scores }: { scores: CompanyScore[] }) {
  const [sector, setSector] = useState("All");
  const sectors = useMemo(
    () => ["All", ...Array.from(new Set(scores.map((s) => s.sector))).sort()],
    [scores],
  );

  const items = useMemo(() => {
    const rows = (sector === "All" ? scores : scores.filter((s) => s.sector === sector))
      .filter((s) => s.thermostat_score_location != null)
      .map((s) => {
        const score = s.thermostat_score_location as number;
        const y = H - scalePosition(score) * H; // cool (1.4) bottom, hot (4.0) top
        return { s, score, y, color: scoreColor(score), labelY: y };
      })
      .sort((a, b) => a.y - b.y); // hottest first (top)

    // Push labels apart so they don't overlap, top → down.
    let last = -Infinity;
    for (const it of rows) {
      it.labelY = Math.max(it.y, last + LABEL_GAP);
      last = it.labelY;
    }
    return rows;
  }, [scores, sector]);

  const contentH = Math.max(H, items.length ? items[items.length - 1].labelY + LABEL_GAP : H);

  return (
    <div>
      {/* sector filter */}
      <div className="mb-10 flex flex-wrap gap-1">
        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => setSector(s)}
            className={`rounded-full px-3 py-1.5 text-xs transition ${
              sector === s ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No scored companies here yet.</p>
      ) : (
        <div className="relative flex gap-3" style={{ height: contentH }}>
          {/* scale labels */}
          <div className="relative w-9 shrink-0 font-mono text-[10px] text-muted-foreground" style={{ height: H }}>
            {TICKS.map((t) => (
              <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: H - scalePosition(t) * H }}>
                {t}°C
              </span>
            ))}
          </div>

          {/* tube + markers */}
          <div className="relative w-3 shrink-0 rounded-full ring-1 ring-black/10" style={{ height: H, background: TUBE_GRADIENT }}>
            {items.map((it) => (
              <div
                key={it.s.company_id}
                className="absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow"
                style={{ top: it.y, background: it.color, border: "2px solid hsl(var(--background))" }}
              />
            ))}
          </div>

          {/* connectors + labels */}
          <div className="relative flex-1">
            <svg className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }} pointerEvents="none">
              {items.map((it) => (
                <line
                  key={it.s.company_id}
                  x1={0}
                  y1={it.y}
                  x2={22}
                  y2={it.labelY}
                  stroke="hsl(var(--border))"
                  strokeWidth="1"
                />
              ))}
            </svg>
            {items.map((it) => (
              <Link
                key={it.s.company_id}
                href={`/company/${it.s.company_id}`}
                className="group absolute flex -translate-y-1/2 items-center gap-2 rounded-md py-0.5 pl-6 pr-2 transition hover:bg-secondary"
                style={{ top: it.labelY }}
              >
                <span className="font-mono text-sm font-semibold tabular-nums" style={{ color: it.color }}>
                  {formatScore(it.score, !!it.s.score_above_max_location, !!it.s.score_below_min_location)}°C
                </span>
                <span className="text-sm font-medium text-foreground">{it.s.company_name}</span>
                <span className="text-xs text-muted-foreground">{it.s.sector}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
