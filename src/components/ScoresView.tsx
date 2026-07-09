"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ScoreCard } from "@/components/ScoreCard";
import { scalePosition, scoreColor, formatScore } from "@/lib/temperature";
import type { CompanyScore } from "@/lib/scores";

type View = "thermometer" | "dashboard";

const TUBE_GRADIENT =
  "linear-gradient(to top, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))";
const GAP = 34; // min vertical spacing between labels on one side

export function ScoresView({ scores }: { scores: CompanyScore[] }) {
  const [view, setView] = useState<View>("dashboard");
  const [sector, setSector] = useState("All");

  const sectors = useMemo(
    () => ["All", ...Array.from(new Set(scores.map((s) => s.sector))).sort()],
    [scores],
  );
  const filtered = useMemo(
    () => (sector === "All" ? scores : scores.filter((s) => s.sector === sector)),
    [scores, sector],
  );

  return (
    <div>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex overflow-hidden rounded-lg border border-border text-xs">
          {(["dashboard", "thermometer"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 font-medium capitalize transition-colors ${
                view === v ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
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
      </div>

      {view === "dashboard" ? <Dashboard rows={filtered} /> : <Thermometer rows={filtered} />}
    </div>
  );
}

function Dashboard({ rows }: { rows: CompanyScore[] }) {
  if (rows.length === 0) return <Empty />;
  const sorted = [...rows].sort(
    (a, b) => (a.thermostat_score_location ?? 99) - (b.thermostat_score_location ?? 99),
  );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sorted.map((c) => (
        <Link key={c.company_id} href={`/company/${c.company_id}`} className="block transition hover:opacity-90">
          <ScoreCard c={c} />
        </Link>
      ))}
    </div>
  );
}

function Thermometer({ rows }: { rows: CompanyScore[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(760);
  const [vh, setVh] = useState(720);
  useEffect(() => {
    const on = () => {
      setW(ref.current?.offsetWidth ?? 760);
      setVh(window.innerHeight);
    };
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  const scored = rows.filter((s) => s.thermostat_score_location != null);
  // Fill down toward the bottom of the page as a minimum; grow taller for more data.
  const H = Math.max(vh - 340, scored.length * 58, 320);
  const TOP = 30; // gap above the tube so the 4.0°C label sits clear
  const cx = w / 2;

  const items = useMemo(() => {
    const base = scored
      .map((s) => {
        const score = s.thermostat_score_location as number;
        return { s, score, y: H - scalePosition(score) * H, color: scoreColor(score), side: "right" as "right" | "left", labelY: 0 };
      })
      .sort((a, b) => a.y - b.y);
    base.forEach((it, i) => (it.side = i % 2 === 0 ? "right" : "left"));
    for (const side of ["left", "right"] as const) {
      let last = -Infinity;
      for (const it of base.filter((x) => x.side === side)) {
        it.labelY = Math.max(it.y, last + GAP);
        last = it.labelY;
      }
    }
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scored]);

  const contentH = Math.max(H + TOP + 20, ...items.map((it) => it.labelY + TOP + GAP)) + 10;

  if (scored.length === 0) return <Empty />;

  return (
    <div ref={ref} className="relative" style={{ height: contentH }}>
      {/* connectors */}
      <svg className="absolute inset-0" width={w} height={contentH} pointerEvents="none">
        {items.map((it) => {
          const fromX = cx + (it.side === "left" ? -7 : 7);
          const toX = cx + (it.side === "left" ? -30 : 30);
          return <line key={it.s.company_id} x1={fromX} y1={it.y + TOP} x2={toX} y2={it.labelY + TOP} stroke="hsl(var(--border))" strokeWidth="1" />;
        })}
      </svg>

      {/* scale end labels (centred, above/below the tube) */}
      <div className="absolute -translate-x-1/2 font-mono text-[10px] text-muted-foreground" style={{ left: cx, top: 2 }}>4.0°C</div>
      <div className="absolute -translate-x-1/2 font-mono text-[10px] text-muted-foreground" style={{ left: cx, top: H + TOP + 6 }}>1.4°C</div>

      {/* tube */}
      <div className="absolute w-3 -translate-x-1/2 rounded-full ring-1 ring-black/10" style={{ left: cx, top: TOP, height: H, background: TUBE_GRADIENT }} />

      {/* markers */}
      {items.map((it) => (
        <div
          key={it.s.company_id}
          className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow"
          style={{ left: cx, top: it.y + TOP, background: it.color, border: "2px solid hsl(var(--background))" }}
        />
      ))}

      {/* labels on both sides */}
      {items.map((it) => (
        <Link
          key={it.s.company_id}
          href={`/company/${it.s.company_id}`}
          className={`group absolute flex -translate-y-1/2 items-center gap-2 rounded-md px-2 py-0.5 transition hover:bg-secondary ${
            it.side === "left" ? "flex-row-reverse text-right" : "text-left"
          }`}
          style={it.side === "left" ? { right: w - cx + 32, top: it.labelY + TOP } : { left: cx + 32, top: it.labelY + TOP }}
        >
          <span className="font-mono text-sm font-semibold tabular-nums" style={{ color: it.color }}>
            {formatScore(it.score, !!it.s.score_above_max_location, !!it.s.score_below_min_location)}°C
          </span>
          <span className="text-sm font-medium text-foreground">{it.s.company_name}</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">{it.s.sector}</span>
        </Link>
      ))}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-muted-foreground">No scored companies here yet.</p>;
}
