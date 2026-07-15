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

// What the number means: a globe beside a thermometer.
export function NumberArt({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 220 150" className={className} {...common}>
      <circle cx="72" cy="75" r="46" />
      <ellipse cx="72" cy="75" rx="19" ry="46" />
      <line x1="26" y1="75" x2="118" y2="75" />
      <path d="M36 50 H108" opacity="0.55" />
      <path d="M36 100 H108" opacity="0.55" />
      <path d="M162 42 a9 9 0 0 1 18 0 v56 a15 15 0 1 1 -18 0 z" />
      <circle cx="171" cy="110" r="7.5" fill="currentColor" stroke="none" />
      <line x1="171" y1="104" x2="171" y2="66" strokeWidth="4" />
      <line x1="185" y1="60" x2="192" y2="60" />
      <line x1="185" y1="76" x2="192" y2="76" />
      <line x1="185" y1="92" x2="192" y2="92" />
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
