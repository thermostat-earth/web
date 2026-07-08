// Temporary preview page for choosing a ThermoStat logo direction.
// Not linked in nav — reachable at /logos. Will be removed once a mark is chosen.

const GRAD = (id: string) => (
  <defs>
    <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stopColor="hsl(0 72% 55%)" />
      <stop offset="0.5" stopColor="hsl(48 90% 52%)" />
      <stop offset="1" stopColor="hsl(145 60% 45%)" />
    </linearGradient>
  </defs>
);

// Concept A — minimal line: Earth behind, thermometer in front, single colour.
function LogoA({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="16" cy="20" r="11" stroke="currentColor" strokeWidth="2" />
      <path d="M5 20 H27" stroke="currentColor" strokeWidth="1.4" opacity="0.4" />
      <ellipse cx="16" cy="20" rx="5" ry="11" stroke="currentColor" strokeWidth="1.4" opacity="0.4" />
      <rect x="25.5" y="5" width="7" height="21" rx="3.5" fill="var(--background)" stroke="currentColor" strokeWidth="2" />
      <rect x="27.5" y="15" width="3" height="15" rx="1.5" fill="currentColor" />
      <circle cx="29" cy="30" r="5" fill="currentColor" />
    </svg>
  );
}

// Concept B — bold: soft-filled Earth, thermometer with green→red gradient mercury.
function LogoB({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {GRAD("gradB")}
      <circle cx="16" cy="20" r="11" fill="currentColor" opacity="0.14" />
      <circle cx="16" cy="20" r="11" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      <path d="M5 20 H27" stroke="currentColor" strokeWidth="1.2" opacity="0.35" />
      <rect x="25.5" y="5" width="7" height="21" rx="3.5" fill="var(--background)" stroke="currentColor" strokeWidth="2" />
      <rect x="27.5" y="14" width="3" height="16" rx="1.5" fill="url(#gradB)" />
      <circle cx="29" cy="30" r="5" fill="url(#gradB)" />
    </svg>
  );
}

// Concept C — integrated: the thermometer bulb IS the Earth (gradient globe).
function LogoC({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      {GRAD("gradC")}
      <rect x="15" y="3" width="8" height="21" rx="4" fill="var(--background)" stroke="currentColor" strokeWidth="2" />
      <rect x="17.5" y="7" width="3" height="15" rx="1.5" fill="url(#gradC)" />
      <circle cx="19" cy="28" r="8.5" fill="url(#gradC)" />
      <path d="M11 28 H27" stroke="var(--background)" strokeWidth="1.2" opacity="0.7" />
      <ellipse cx="19" cy="28" rx="3.6" ry="8.5" stroke="var(--background)" strokeWidth="1.2" opacity="0.7" />
    </svg>
  );
}

const CONCEPTS = [
  { key: "A", label: "A — Minimal line", node: LogoA },
  { key: "B", label: "B — Bold + gradient bulb", node: LogoB },
  { key: "C", label: "C — Integrated (Earth = bulb)", node: LogoC },
];

export default function LogosPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16 text-foreground">
      <h1 className="text-2xl font-bold tracking-tight">Logo concepts</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Thermometer + Earth. Each shown large, as it&apos;d sit top-left with the
        wordmark, and at favicon size. Pick a direction and I&apos;ll refine it.
      </p>

      <div className="mt-10 flex flex-col gap-12">
        {CONCEPTS.map(({ key, label, node: Logo }) => (
          <section key={key} className="border-t border-border pt-8">
            <h2 className="mb-6 text-sm font-semibold text-muted-foreground">{label}</h2>
            <div className="flex flex-wrap items-center gap-10">
              <Logo size={96} />
              <div className="flex items-center gap-2">
                <Logo size={32} />
                <span className="text-lg font-semibold tracking-tight">ThermoStat</span>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                <Logo size={20} />
                <span className="text-xs text-muted-foreground">favicon size</span>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
