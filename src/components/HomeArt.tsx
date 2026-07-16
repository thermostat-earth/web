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
  const base = 138;
  const barW = 15;
  const tops = [48, 54, 52, 62, 70, 78, 86, 92]; // top-y per column (declining)
  const labels = [
    { y: 49, text: "4°C", w: 27, color: "hsl(0 72% 65%)" },
    { y: 72, text: "3°C", w: 27, color: "hsl(32 92% 62%)" },
    { y: 101, text: "1.5°C", w: 38, color: "hsl(145 55% 60%)" },
  ];
  return (
    <svg viewBox="0 0 240 160" className={className} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ts-bar-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(var(--foreground))" stopOpacity="1" />
          <stop offset="1" stopColor="hsl(var(--foreground))" stopOpacity="0.8" />
        </linearGradient>
        <filter id="ts-bar-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.6" floodColor="#ffffff" floodOpacity="0.32" />
        </filter>
      </defs>

      {/* legend: the bars are a company's emissions */}
      <rect x="14" y="8" width="8.5" height="8.5" rx="2.5" fill="hsl(var(--foreground))" />
      <text x="27" y="15.5" className="font-mono" fontSize="9" fill="hsl(var(--muted-foreground))">
        Company emissions
      </text>

      {/* baseline + time hint */}
      <line x1="14" y1={base} x2="226" y2={base} stroke="currentColor" strokeWidth="1" strokeOpacity="0.28" />
      <text x="226" y={base + 14} textAnchor="end" className="font-mono" fontSize="9" fill="hsl(var(--muted-foreground))">
        over time →
      </text>

      {/* emission columns — white, subtle top-light, soft glow */}
      <g filter="url(#ts-bar-glow)">
        {tops.map((top, i) => (
          <rect key={i} x={22 + i * 25} y={top} width={barW} height={base - top} rx="2.5" fill="url(#ts-bar-fill)" />
        ))}
      </g>

      {/* temperature pathways — fine dotted */}
      <path d="M22 42 C 92 48, 150 51, 218 54" stroke="hsl(0 72% 58%)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 5" />
      <path d="M22 42 C 92 62, 150 80, 218 90" stroke="hsl(32 90% 56%)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 5" />
      <path d="M22 42 C 82 86, 150 118, 218 132" stroke="hsl(145 60% 48%)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 5" />

      {/* pathway labels — refined pills centred on each line */}
      {labels.map((l) => (
        <g key={l.text}>
          <rect
            x={120 - l.w / 2}
            y={l.y - 8}
            width={l.w}
            height="16"
            rx="8"
            fill="hsl(var(--background))"
            fillOpacity="0.86"
            stroke={l.color}
            strokeOpacity="0.35"
            strokeWidth="0.75"
          />
          <text x="120" y={l.y + 3} textAnchor="middle" className="font-mono" fontSize="10" fill={l.color}>
            {l.text}
          </text>
        </g>
      ))}
    </svg>
  );
}

// Independent, not for sale: a coin, struck through.
export function IndependentArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 160 150" className={className} {...common}>
      <circle cx="80" cy="75" r="48" />
      <circle cx="80" cy="75" r="37" opacity="0.5" />
      {/* a plain currency mark */}
      <path d="M88 60 a11 11 0 0 0 -19 8 v22" />
      <line x1="66" y1="92" x2="92" y2="92" />
      <line x1="64" y1="78" x2="83" y2="78" />
      {/* struck through */}
      <line x1="46" y1="109" x2="114" y2="41" strokeWidth="2.5" />
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
