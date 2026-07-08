// ThermoStat mark: a thermometer centred over the globe, one continuous
// green→red gradient (green bulb at the bottom, red at the top). Uses
// currentColor for the outline and hsl(var(--background)) to mask the globe
// lines under the thermometer, so it adapts to light/dark automatically.
export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ts-therm" gradientUnits="userSpaceOnUse" x1="20" y1="35" x2="20" y2="7">
          <stop offset="0" stopColor="hsl(145 60% 45%)" />
          <stop offset="0.55" stopColor="hsl(48 90% 52%)" />
          <stop offset="1" stopColor="hsl(0 72% 55%)" />
        </linearGradient>
      </defs>

      <circle cx="20" cy="22" r="11" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 22 H31" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <ellipse cx="20" cy="22" rx="7" ry="11" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <ellipse cx="20" cy="22" rx="3.2" ry="11" stroke="currentColor" strokeWidth="0.9" opacity="0.4" />

      <circle cx="20" cy="30" r="5.5" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="1.3" />
      <rect x="16.8" y="4.5" width="6.4" height="24" rx="3.2" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="1.3" />
      <rect x="18" y="22" width="4" height="8" fill="hsl(var(--background))" />

      <circle cx="20" cy="30" r="3.4" fill="url(#ts-therm)" />
      <rect x="18.4" y="9.5" width="3.2" height="20.5" rx="1.6" fill="url(#ts-therm)" />
    </svg>
  );
}
