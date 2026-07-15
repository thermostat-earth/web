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
  const base = 130;
  const barW = 14;
  const tops = [46, 54, 50, 62, 68, 74, 80, 84]; // top-y per column (declining)
  return (
    <svg viewBox="0 0 262 146" className={className} fill="none" aria-hidden="true">
      {/* baseline */}
      <line x1="10" y1={base} x2="208" y2={base} stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
      {/* emission columns — solid white, rounded (as on the company page) */}
      {tops.map((top, i) => (
        <rect
          key={i}
          x={14 + i * 24}
          y={top}
          width={barW}
          height={base - top}
          rx="2"
          fill="hsl(var(--foreground))"
        />
      ))}
      {/* temperature pathways — thin, dotted */}
      <path d="M16 48 C 88 52, 150 54, 206 56" stroke="hsl(0 72% 58%)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1 5" />
      <path d="M16 48 C 90 68, 150 86, 206 94" stroke="hsl(32 90% 56%)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1 5" />
      <path d="M16 48 C 82 88, 150 116, 206 126" stroke="hsl(145 60% 48%)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1 5" />
      {/* pathway labels */}
      <text x="212" y="60" className="font-mono" fontSize="11" fill="hsl(0 72% 64%)">4°C</text>
      <text x="212" y="98" className="font-mono" fontSize="11" fill="hsl(32 90% 60%)">3°C</text>
      <text x="212" y="130" className="font-mono" fontSize="11" fill="hsl(145 55% 58%)">1.5°C</text>
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
