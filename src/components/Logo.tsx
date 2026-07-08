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
        <linearGradient id="ts-therm" gradientUnits="userSpaceOnUse" x1="20" y1="32" x2="20" y2="8">
          <stop offset="0" stopColor="hsl(145 60% 45%)" />
          <stop offset="0.55" stopColor="hsl(48 90% 52%)" />
          <stop offset="1" stopColor="hsl(0 72% 55%)" />
        </linearGradient>
      </defs>

      {/* Content centred on y=20 (the box centre) so it aligns with the wordmark. */}
      <circle cx="20" cy="20" r="11" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 20 H31" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <ellipse cx="20" cy="20" rx="7" ry="11" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <ellipse cx="20" cy="20" rx="3.2" ry="11" stroke="currentColor" strokeWidth="0.9" opacity="0.4" />

      {/* thermometer: a simple rounded capsule (no bulb), centred on the globe
          so it protrudes equally above and below */}
      <rect x="17" y="6" width="6" height="28" rx="3" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="1.3" />
      <rect x="18.4" y="7.6" width="3.2" height="24.8" rx="1.6" fill="url(#ts-therm)" />
    </svg>
  );
}
