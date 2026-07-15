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
  const bw = 18;
  const tops = [44, 52, 48, 60, 66, 72, 78, 82]; // top-y per column (declining)
  return (
    <svg viewBox="0 0 250 148" className={className} fill="none" aria-hidden="true">
      {/* baseline */}
      <line x1="14" y1={base} x2="210" y2={base} stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
      {/* emission columns */}
      {tops.map((top, i) => (
        <rect
          key={i}
          x={16 + i * 24}
          y={top}
          width={bw}
          height={base - top}
          rx="1.5"
          fill="currentColor"
          fillOpacity="0.16"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.8"
        />
      ))}
      {/* temperature pathways, fanning from a common start */}
      <path d="M20 46 C 90 50, 150 52, 208 54" stroke="hsl(0 72% 56%)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M20 46 C 92 66, 150 84, 208 92" stroke="hsl(32 90% 55%)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M20 46 C 84 86, 150 116, 208 126" stroke="hsl(145 60% 46%)" strokeWidth="2.4" strokeLinecap="round" />
      {/* pathway labels */}
      <text x="214" y="58" className="font-mono" fontSize="11" fill="hsl(0 72% 63%)">4°</text>
      <text x="214" y="96" className="font-mono" fontSize="11" fill="hsl(32 90% 60%)">3°</text>
      <text x="214" y="130" className="font-mono" fontSize="11" fill="hsl(145 55% 56%)">1.5°</text>
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
