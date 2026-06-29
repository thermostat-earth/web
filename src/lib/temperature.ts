// Helpers for placing a company's temperature on the <1.5°C … >4.5°C scale
// and colouring it green (cool / well aligned) → red (hot / poorly aligned).

export const SCALE_MIN = 1.5;
export const SCALE_MAX = 4.5;

export function scalePosition(score: number): number {
  const t = (score - SCALE_MIN) / (SCALE_MAX - SCALE_MIN);
  return Math.min(1, Math.max(0, t));
}

export function scoreColor(score: number): string {
  const hue = 145 - 145 * scalePosition(score); // 145 green → 0 red
  return `hsl(${hue} 60% 42%)`;
}

export const TEMPERATURE_GRADIENT =
  "linear-gradient(to right, hsl(145 60% 42%), hsl(48 90% 50%), hsl(0 72% 51%))";

export function formatScore(
  score: number,
  aboveMax: boolean,
  belowMin: boolean,
): string {
  if (aboveMax) return `> ${score.toFixed(1)}`;
  if (belowMin) return `< ${score.toFixed(1)}`;
  return score.toFixed(2);
}
