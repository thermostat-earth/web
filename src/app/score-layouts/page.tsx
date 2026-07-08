// Temporary preview: three structures for the score + thermometer in the company
// header. Reachable at /score-layouts. Removed once a layout is chosen.
import { scalePosition, scoreColor, formatScore, SCALE_MIN, SCALE_MAX } from "@/lib/temperature";

type Sample = {
  name: string;
  meta: string;
  score: number;
  sector: number;
  aboveMax?: boolean;
  belowMin?: boolean;
};

const HM: Sample = { name: "H&M Group", meta: "Fashion · Sweden", score: 1.51, sector: 2.75 };
const MSFT: Sample = { name: "Microsoft", meta: "Tech · US", score: 4.0, sector: 4.0, aboveMax: true };

const TUBE_GRADIENT =
  "linear-gradient(to top, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))";

// Shared vertical thermometer with markers, arrows, gap band and key.
function VThermo({ s, height = 150, big }: { s: Sample; height?: number; big?: boolean }) {
  const color = scoreColor(s.score);
  const pos = s.aboveMax ? 100 : s.belowMin ? 0 : scalePosition(s.score) * 100;
  const sectorPos = scalePosition(s.sector) * 100;
  const gapLo = Math.min(pos, sectorPos);
  const gapHi = Math.max(pos, sectorPos);
  const markerStyle: React.CSSProperties = s.aboveMax
    ? { bottom: "calc(100% + 8px)", transform: "translate(-50%,0)" }
    : s.belowMin
      ? { bottom: "-24px", transform: "translate(-50%,0)" }
      : { bottom: `${pos}%`, transform: "translate(-50%,50%)" };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2" style={{ height }}>
        <div className="flex flex-col justify-between py-[3px] text-right font-mono text-[10px] text-muted-foreground">
          <span>{SCALE_MAX.toFixed(1)}</span>
          <span>2.7</span>
          <span>{SCALE_MIN.toFixed(1)}</span>
        </div>
        <div className="relative w-3 rounded-full ring-1 ring-black/10" style={{ background: TUBE_GRADIENT }}>
          {/* gap band between company and sector */}
          <div
            className="absolute inset-x-0 rounded-sm bg-foreground/15 ring-1 ring-foreground/25"
            style={{ bottom: `${gapLo}%`, height: `${gapHi - gapLo}%` }}
          />
          {/* sector marker + arrow */}
          <div className="absolute left-1/2 h-[3px] w-6 -translate-x-1/2 translate-y-1/2 rounded-full bg-foreground ring-1 ring-background" style={{ bottom: `${sectorPos}%` }} />
          <div className="absolute -translate-y-1/2" style={{ bottom: `${sectorPos}%`, left: "calc(50% + 16px)" }}>
            <Arrow className="text-foreground" />
          </div>
          {/* company marker + arrow (+ optional readout) */}
          <div className="absolute left-1/2 h-4 w-4 rounded-full shadow" style={{ ...markerStyle, background: color, border: "3px solid hsl(var(--background))" }} />
          <div className="absolute flex items-center gap-1 -translate-y-1/2" style={{ bottom: s.aboveMax ? "calc(100% + 8px)" : s.belowMin ? "-16px" : `${pos}%`, left: "calc(50% + 16px)" }}>
            <Arrow style={{ color }} />
            {big && (
              <span className="whitespace-nowrap font-mono text-2xl font-semibold leading-none" style={{ color }}>
                {formatScore(s.score, !!s.aboveMax, !!s.belowMin)}°C
              </span>
            )}
          </div>
        </div>
      </div>
      <Key color={color} />
    </div>
  );
}

function Arrow({ className, style }: { className?: string; style?: React.CSSProperties }) {
  // small left-pointing triangle
  return (
    <span
      className={className}
      style={{ ...style, width: 0, height: 0, borderTop: "4px solid transparent", borderBottom: "4px solid transparent", borderRight: "6px solid currentColor", display: "inline-block" }}
    />
  );
}

function Key({ color }: { color: string }) {
  return (
    <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color, border: "2px solid hsl(var(--background))" }} /> this company
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-[3px] w-3.5 rounded-full bg-foreground" /> sector average
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-3.5 rounded-sm bg-foreground/15 ring-1 ring-foreground/25" /> gap vs sector
      </span>
    </div>
  );
}

function HScale({ s }: { s: Sample }) {
  const color = scoreColor(s.score);
  const pos = s.aboveMax ? 100 : s.belowMin ? 0 : scalePosition(s.score) * 100;
  const sectorPos = scalePosition(s.sector) * 100;
  const gapLo = Math.min(pos, sectorPos);
  const gapHi = Math.max(pos, sectorPos);
  return (
    <div className="w-full max-w-md">
      <div className="relative h-3 rounded-full" style={{ background: "linear-gradient(to right, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))" }}>
        <div className="absolute inset-y-0 rounded-sm bg-foreground/15 ring-1 ring-foreground/25" style={{ left: `${gapLo}%`, width: `${gapHi - gapLo}%` }} />
        <div className="absolute top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground ring-4 ring-foreground/60" style={{ left: `${sectorPos}%` }} />
        <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full shadow" style={{ left: `${pos}%`, background: color, border: "3px solid hsl(var(--background))" }} />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>{SCALE_MIN.toFixed(1)}</span><span>2.7</span><span>{SCALE_MAX.toFixed(1)}</span>
      </div>
      <div className="mt-2"><Key color={color} /></div>
    </div>
  );
}

function Title({ s }: { s: Sample }) {
  return (
    <div>
      <h3 className="text-2xl font-bold tracking-tight">{s.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{s.meta}</p>
      <div className="mt-3 inline-flex overflow-hidden rounded-lg border border-border text-xs">
        <span className="bg-secondary px-3 py-1.5 font-medium">location</span>
        <span className="px-3 py-1.5 text-muted-foreground">market</span>
      </div>
    </div>
  );
}

function LayoutA({ s }: { s: Sample }) {
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border p-6 sm:flex-row sm:items-center sm:justify-between">
      <Title s={s} />
      <VThermo s={s} big />
    </div>
  );
}

function LayoutB({ s }: { s: Sample }) {
  const color = scoreColor(s.score);
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border p-6 sm:flex-row sm:items-center sm:justify-between">
      <Title s={s} />
      <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-5">
        <div className="font-mono text-5xl font-semibold leading-none" style={{ color }}>
          {formatScore(s.score, !!s.aboveMax, !!s.belowMin)}<span className="text-xl"> °C</span>
        </div>
        <VThermo s={s} height={130} />
      </div>
    </div>
  );
}

function LayoutC({ s }: { s: Sample }) {
  const color = scoreColor(s.score);
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-6">
      <div className="flex items-start justify-between">
        <Title s={s} />
        <div className="font-mono text-6xl font-semibold leading-none" style={{ color }}>
          {formatScore(s.score, !!s.aboveMax, !!s.belowMin)}<span className="text-2xl"> °C</span>
        </div>
      </div>
      <HScale s={s} />
    </div>
  );
}

export default function ScoreLayoutsPage() {
  const layouts = [
    { key: "A", label: "Layout A — Unified readout", render: (s: Sample) => <LayoutA s={s} /> },
    { key: "B", label: "Layout B — Score panel", render: (s: Sample) => <LayoutB s={s} /> },
    { key: "C", label: "Layout C — Number over horizontal scale", render: (s: Sample) => <LayoutC s={s} /> },
  ];
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16 text-foreground">
      <h1 className="text-2xl font-bold tracking-tight">Score + thermometer — layout options</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Each shown with a well-aligned company (H&amp;M, gap below sector) and a clamped one (Microsoft, &gt;4.0). Includes marker arrows, the translucent gap band, and the key.
      </p>
      <div className="mt-10 flex flex-col gap-14">
        {layouts.map((l) => (
          <section key={l.key}>
            <h2 className="mb-4 text-sm font-semibold text-muted-foreground">{l.label}</h2>
            <div className="flex flex-col gap-5">
              {l.render(HM)}
              {l.render(MSFT)}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
