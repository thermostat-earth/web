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
const TICKS = [1.4, 2, 3, 4];

export function ScoresView({ scores }: { scores: CompanyScore[] }) {
  const [view, setView] = useState<View>("dashboard");
  const [sector, setSector] = useState("All");

  // Allow deep-linking a view, e.g. /scores?view=thermometer
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("view");
    if (v === "thermometer" || v === "dashboard") setView(v);
  }, []);

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
      <p className="mb-10 text-muted-foreground">
        {view === "thermometer"
          ? "Every company on one temperature scale — coolest at the bottom."
          : "Every company's climate temperature score against IPCC pathways — coolest first."}
      </p>
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

  // Fit the page while there are few companies; grow downward (the reader
  // scrolls) only once there are enough to warrant a taller scale.
  const H = Math.max(vh - 380, scored.length * 60, 300);
  const TOP = 34; // gap above the tube for the top tick + any off-scale dot
  const OFF = 14; // how far an off-scale dot sits beyond the tube end
  const cx = w / 2;

  const items = useMemo(() => {
    const base = scored
      .map((s) => {
        const score = s.thermostat_score_location as number;
        const aboveMax = !!s.score_above_max_location;
        const belowMin = !!s.score_below_min_location;
        const frac = aboveMax ? 1 : belowMin ? 0 : scalePosition(score);
        let y = H - frac * H; // coolest (low °C) at the bottom
        if (aboveMax) y = -OFF; // just above the hot (top) end
        if (belowMin) y = H + OFF; // just below the cool (bottom) end
        return {
          s,
          score,
          aboveMax,
          belowMin,
          y,
          color: scoreColor(score),
          side: "right" as "right" | "left",
          labelY: 0,
        };
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
  }, [scored, H]);

  const contentH =
    Math.max(H + TOP + 24, ...items.map((it) => it.labelY + TOP + GAP)) + 10;

  if (scored.length === 0) return <Empty />;

  return (
    <div>
      {/* key */}
      <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full bg-foreground"
            style={{ border: "2px solid hsl(var(--background))" }}
          />
          A company&apos;s climate temperature score
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-mono">&gt;</span>
          <span>/</span>
          <span className="font-mono">&lt;</span>
          beyond the 1.4–4.0°C scale
        </span>
      </div>

      <div ref={ref} className="relative" style={{ height: contentH }}>
        {/* connectors */}
        <svg className="absolute inset-0" width={w} height={contentH} pointerEvents="none">
          {items.map((it) => {
            const fromX = cx + (it.side === "left" ? -7 : 7);
            const toX = cx + (it.side === "left" ? -30 : 30);
            return (
              <line
                key={it.s.company_id}
                x1={fromX}
                y1={it.y + TOP}
                x2={toX}
                y2={it.labelY + TOP}
                stroke="hsl(var(--border))"
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* tube */}
        <div
          className="absolute w-3 -translate-x-1/2 rounded-full ring-1 ring-black/10"
          style={{ left: cx, top: TOP, height: H, background: TUBE_GRADIENT }}
        />

        {/* scale ticks: 1.4 / 2 / 3 / 4 °C, centred on the tube */}
        {TICKS.map((v) => (
          <div
            key={v}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: cx, top: TOP + (H - scalePosition(v) * H) }}
          >
            <span className="rounded-sm border border-border bg-background/85 px-1 py-px font-mono text-[9px] leading-none text-muted-foreground">
              {v.toFixed(1)}°C
            </span>
          </div>
        ))}

        {/* off-scale bridges + company markers */}
        {items.map((it) => (
          <div key={it.s.company_id}>
            {it.aboveMax && (
              <div
                className="absolute w-1 -translate-x-1/2"
                style={{ left: cx, top: TOP - OFF, height: OFF, background: "hsl(0 72% 51%)" }}
              />
            )}
            {it.belowMin && (
              <div
                className="absolute w-1 -translate-x-1/2"
                style={{ left: cx, top: TOP + H, height: OFF, background: "hsl(145 60% 42%)" }}
              />
            )}
            <div
              className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow"
              style={{ left: cx, top: it.y + TOP, background: it.color, border: "2px solid hsl(var(--background))" }}
            />
          </div>
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
              {formatScore(it.score, it.aboveMax, it.belowMin)}°C
            </span>
            <span className="text-sm font-medium text-foreground">{it.s.company_name}</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">{it.s.sector}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-muted-foreground">No scored companies here yet.</p>;
}
