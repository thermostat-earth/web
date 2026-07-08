// Temporary preview page for refining the ThermoStat logo (Concept A).
// Not linked in nav — reachable at /logos. Removed once the mark is locked.

// Concept A (refined): Earth outline, thermometer centred directly over it,
// with ONE continuous gradient — green at the bulb (bottom) up to red at the top.
function Logo({ size }: { size: number }) {
  const gid = `therm-${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="20" y1="35" x2="20" y2="7">
          <stop offset="0" stopColor="hsl(145 60% 45%)" />
          <stop offset="0.55" stopColor="hsl(48 90% 52%)" />
          <stop offset="1" stopColor="hsl(0 72% 55%)" />
        </linearGradient>
      </defs>

      {/* Earth, centred. Rounder, more visible longitude curves. */}
      <circle cx="20" cy="22" r="11" stroke="currentColor" strokeWidth="2" />
      <path d="M9 22 H31" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <ellipse cx="20" cy="22" rx="7" ry="11" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <ellipse cx="20" cy="22" rx="3.2" ry="11" stroke="currentColor" strokeWidth="1.3" opacity="0.4" />

      {/* Thermometer outline, centred over the globe. Solid body (not see-through). */}
      <circle cx="20" cy="30" r="5.5" fill="#eef1f4" stroke="currentColor" strokeWidth="2" />
      <rect x="16.8" y="4.5" width="6.4" height="24" rx="3.2" fill="#eef1f4" stroke="currentColor" strokeWidth="2" />
      {/* hide the internal seam where the tube meets the bulb */}
      <rect x="18" y="22" width="4" height="8" fill="#eef1f4" />

      {/* Mercury: bulb + stem sharing one continuous gradient */}
      <circle cx="20" cy="30" r="3.4" fill={`url(#${gid})`} />
      <rect x="18.4" y="9.5" width="3.2" height="20.5" rx="1.6" fill={`url(#${gid})`} />
    </svg>
  );
}

export default function LogosPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16 text-foreground">
      <h1 className="text-2xl font-bold tracking-tight">Logo — Concept A (refined)</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Thermometer centred over the globe. One continuous gradient: green at the
        bulb, red at the top.
      </p>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="mb-6 text-sm font-semibold text-muted-foreground">On dark (default)</h2>
        <div className="flex flex-wrap items-center gap-10">
          <Logo size={112} />
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

      <section className="mt-8 border-t border-border pt-8">
        <h2 className="mb-6 text-sm font-semibold text-muted-foreground">On light (check for light mode)</h2>
        <div className="flex flex-wrap items-center gap-10 rounded-lg bg-white p-8 text-slate-900" style={{ ["--background" as string]: "#ffffff" }}>
          <Logo size={112} />
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-lg font-semibold tracking-tight">ThermoStat</span>
          </div>
        </div>
      </section>
    </main>
  );
}
