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
  const base = 150;
  const barW = 16;
  const tops = [52, 60, 56, 70, 78, 86, 94, 100]; // top-y per column (declining)
  const labels = [
    { y: 50, text: "4°C", w: 30, color: "hsl(0 72% 64%)" },
    { y: 75, text: "3°C", w: 30, color: "hsl(32 90% 60%)" },
    { y: 107, text: "1.5°C", w: 42, color: "hsl(145 55% 58%)" },
  ];
  return (
    <svg viewBox="0 0 240 172" className={className} fill="none" aria-hidden="true">
      <defs>
        <filter id="ts-bar-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="hsl(220 60% 3%)" floodOpacity="0.55" />
        </filter>
      </defs>
      {/* baseline */}
      <line x1="16" y1={base} x2="224" y2={base} stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" />
      {/* emission columns — translucent white, soft shadow (glassy) */}
      <g filter="url(#ts-bar-shadow)">
        {tops.map((top, i) => (
          <rect
            key={i}
            x={22 + i * 25}
            y={top}
            width={barW}
            height={base - top}
            rx="2.5"
            fill="hsl(var(--foreground))"
            fillOpacity="0.5"
            stroke="hsl(var(--foreground))"
            strokeOpacity="0.25"
            strokeWidth="0.75"
          />
        ))}
      </g>
      {/* temperature pathways — thin, dotted */}
      <path d="M22 42 C 92 49, 150 53, 218 57" stroke="hsl(0 72% 58%)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1 5" />
      <path d="M22 42 C 92 66, 150 86, 218 98" stroke="hsl(32 90% 56%)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1 5" />
      <path d="M22 42 C 82 92, 150 130, 218 146" stroke="hsl(145 60% 48%)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1 5" />
      {/* labels — rounded translucent pills, centred on each line */}
      {labels.map((l) => (
        <g key={l.text}>
          <rect
            x={120 - l.w / 2}
            y={l.y - 9}
            width={l.w}
            height="18"
            rx="6"
            fill="hsl(var(--background))"
            fillOpacity="0.8"
            stroke={l.color}
            strokeOpacity="0.45"
            strokeWidth="1"
          />
          <text x="120" y={l.y + 3.5} textAnchor="middle" className="font-mono" fontSize="11" fill={l.color}>
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
