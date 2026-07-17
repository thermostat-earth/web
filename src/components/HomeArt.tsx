// Minimalist white line drawings for the homepage sections.
// Monochrome (currentColor) so they sit quietly on the dark theme.

type ArtProps = { className?: string };

const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

// What the number means: a company's emission columns (white) with the
// temperature pathways curving over the top (1.5°C green, 3°C orange, 4°C red),
// labelled at their ends.
export function NumberArt({ className }: ArtProps) {
  const base = 132;
  const barW = 15;
  const tops = [46, 52, 48, 56, 54, 62, 66, 72, 76, 82, 86, 90]; // 12 columns, declining
  const labels = [
    { y: 47, text: "4°C", w: 27, color: "hsl(0 85% 73%)" },
    { y: 67, text: "3°C", w: 27, color: "hsl(35 95% 68%)" },
    { y: 93, text: "1.5°C", w: 38, color: "hsl(145 62% 68%)" },
  ];
  return (
    <svg viewBox="0 0 300 156" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ts-bar-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(var(--foreground))" stopOpacity="1" />
          <stop offset="1" stopColor="hsl(var(--foreground))" stopOpacity="0.8" />
        </linearGradient>
        <filter id="ts-bar-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="3.6" floodColor="#ffffff" floodOpacity="0.5" />
        </filter>
        <filter id="ts-path-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.6" floodColor="hsl(220 55% 4%)" floodOpacity="0.9" />
        </filter>
      </defs>

      {/* legend: the bars are a company's emissions (left edge aligned to the bars) */}
      <rect x="20" y="8" width="8.5" height="8.5" rx="2.5" fill="hsl(var(--foreground))" />
      <text x="33" y="15.5" className="font-mono" fontSize="9" fill="hsl(var(--muted-foreground))">
        Company emissions
      </text>

      {/* baseline + time hint */}
      <line x1="20" y1={base} x2="286" y2={base} stroke="currentColor" strokeWidth="1" strokeOpacity="0.28" />
      <text x="286" y={base + 14} textAnchor="end" className="font-mono" fontSize="9" fill="hsl(var(--muted-foreground))">
        over time →
      </text>

      {/* emission columns — white, subtle top-light, soft glow */}
      <g filter="url(#ts-bar-glow)">
        {tops.map((top, i) => (
          <rect key={i} x={20 + i * 22.5} y={top} width={barW} height={base - top} rx="2.5" fill="url(#ts-bar-fill)" />
        ))}
      </g>

      {/* temperature pathways — fine dotted, dark halo so they read over the white bars */}
      <g filter="url(#ts-path-shadow)">
        <path d="M20 40 C 110 46, 200 49, 285 52" stroke="hsl(0 72% 58%)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 5" />
        <path d="M20 40 C 110 60, 200 76, 285 84" stroke="hsl(32 90% 56%)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 5" />
        <path d="M20 40 C 100 82, 200 112, 285 122" stroke="hsl(145 60% 48%)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 5" />
      </g>

      {/* pathway labels — refined pills centred on each line */}
      {labels.map((l) => (
        <g key={l.text}>
          <rect
            x={154 - l.w / 2}
            y={l.y - 8}
            width={l.w}
            height="16"
            rx="8"
            fill="hsl(var(--background))"
            fillOpacity="0.86"
            stroke={l.color}
            strokeOpacity="0.4"
            strokeWidth="0.75"
          />
          <text x="154" y={l.y + 3} textAnchor="middle" className="font-mono" fontSize="10" fill={l.color}>
            {l.text}
          </text>
        </g>
      ))}
    </svg>
  );
}

// What ThermoStat is for: a magnifier over messy reports — the clutter of
// disclosures made clear and checkable (one clean, green reading in the lens).
export function MagnifyArt({ className }: ArtProps) {
  const lx = 178;
  const ly = 90;
  const lr = 42;
  const docs = [
    { r: -11, ox: 40, oy: 26 },
    { r: 9, ox: 74, oy: 40 },
    { r: -4, ox: 58, oy: 58 },
  ];
  return (
    <svg viewBox="0 0 264 176" className={className} fill="none" aria-hidden="true">
      <defs>
        <clipPath id="ts-lens-clip">
          <circle cx={lx} cy={ly} r={lr - 2} />
        </clipPath>
        <filter id="ts-lens-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.8" floodColor="#ffffff" floodOpacity="0.32" />
        </filter>
      </defs>

      {/* messy reports behind — folded-corner documents */}
      <g
        stroke="hsl(var(--foreground))"
        strokeOpacity="0.42"
        strokeWidth="1.4"
        fill="hsl(var(--foreground))"
        fillOpacity="0.05"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {docs.map((d, i) => (
          <g key={i} transform={`rotate(${d.r} ${d.ox + 28} ${d.oy + 38})`}>
            <path d={`M${d.ox} ${d.oy} h42 l13 13 v61 h-55 z`} />
            <path d={`M${d.ox + 42} ${d.oy} v13 h13`} />
            <line x1={d.ox + 10} y1={d.oy + 30} x2={d.ox + 44} y2={d.oy + 30} strokeOpacity="0.3" />
            <line x1={d.ox + 10} y1={d.oy + 42} x2={d.ox + 44} y2={d.oy + 42} strokeOpacity="0.3" />
            <line x1={d.ox + 10} y1={d.oy + 54} x2={d.ox + 34} y2={d.oy + 54} strokeOpacity="0.3" />
          </g>
        ))}
      </g>

      {/* clean, magnified reading inside the lens */}
      <g clipPath="url(#ts-lens-clip)">
        <circle cx={lx} cy={ly} r={lr} fill="hsl(var(--background))" fillOpacity="0.66" />
        <line x1={lx - 24} y1={ly - 10} x2={lx + 22} y2={ly - 10} stroke="hsl(145 60% 58%)" strokeWidth="3" strokeLinecap="round" />
        <line x1={lx - 24} y1={ly + 1} x2={lx + 18} y2={ly + 1} stroke="hsl(var(--foreground))" strokeOpacity="0.85" strokeWidth="2.2" strokeLinecap="round" />
        <line x1={lx - 24} y1={ly + 12} x2={lx + 8} y2={ly + 12} stroke="hsl(var(--foreground))" strokeOpacity="0.6" strokeWidth="2.2" strokeLinecap="round" />
      </g>

      {/* handle, rim, and a soft glass glint */}
      <line x1={lx + 29} y1={ly + 29} x2={lx + 54} y2={ly + 54} stroke="hsl(var(--foreground))" strokeWidth="8" strokeLinecap="round" filter="url(#ts-lens-glow)" />
      <circle cx={lx} cy={ly} r={lr} stroke="hsl(var(--foreground))" strokeWidth="3.6" filter="url(#ts-lens-glow)" />
      <path d={`M${lx - 27} ${ly - 12} Q ${lx - 24} ${ly - 27} ${lx - 10} ${ly - 32}`} stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// How a company becomes a temperature: a report turns into a thermometer.
export function MethodArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 250 150" className={className} {...common}>
      {/* report */}
      <path d="M44 28 h46 l18 18 v76 h-64 z" />
      <path d="M90 28 v18 h18" />
      <line x1="56" y1="64" x2="96" y2="64" opacity="0.7" />
      <line x1="56" y1="78" x2="96" y2="78" opacity="0.7" />
      <line x1="56" y1="92" x2="84" y2="92" opacity="0.7" />
      {/* arrow */}
      <line x1="126" y1="76" x2="158" y2="76" />
      <path d="M150 68 l8 8 l-8 8" />
      {/* thermometer */}
      <path d="M196 46 a9 9 0 0 1 18 0 v50 a15 15 0 1 1 -18 0 z" />
      <circle cx="205" cy="108" r="7.5" fill="currentColor" stroke="none" />
      <line x1="205" y1="102" x2="205" y2="68" strokeWidth="4" />
    </svg>
  );
}
