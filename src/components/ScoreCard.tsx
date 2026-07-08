import { VerticalThermometer } from "@/components/VerticalThermometer";
import { scoreColor, formatScore } from "@/lib/temperature";
import type { CompanyScore } from "@/lib/scores";

export function ScoreCard({ c }: { c: CompanyScore }) {
  const score = c.thermostat_score_location;
  const meta = [c.sector, c.country_hq].filter(Boolean).join(" · ");

  if (score == null) {
    return (
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="text-sm font-medium">{c.company_name}</div>
        <div className="text-xs text-muted-foreground">{meta}</div>
        <div className="mt-3 font-mono text-sm text-muted-foreground">
          Not yet scored
        </div>
      </div>
    );
  }

  const color = scoreColor(score);
  const median = c.sector_median_score_location;
  const diff = median != null ? score - median : null;
  const vsSector =
    diff == null
      ? null
      : Math.abs(diff) < 0.05
        ? "= sector avg"
        : `${diff > 0 ? "+" : "−"}${Math.abs(diff).toFixed(2)}°C vs sector`;

  return (
    <div
      className="flex gap-4 rounded-lg border border-border bg-card p-5"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{c.company_name}</div>
        <div className="text-xs text-muted-foreground">{meta}</div>
        <div
          className="mt-3 font-mono text-3xl font-semibold leading-none"
          style={{ color }}
        >
          {formatScore(
            score,
            !!c.score_above_max_location,
            !!c.score_below_min_location,
          )}
          <span className="text-lg"> °C</span>
        </div>
        {vsSector && (
          <div
            className="mt-2 font-mono text-xs"
            style={{ color: vsSector === "= sector avg" ? undefined : color }}
          >
            {vsSector}
          </div>
        )}
        {(c.assessment_year_start || c.assessment_year_end) && (
          <div className="mt-3 font-mono text-[10px] text-muted-foreground">
            {c.assessment_year_start}–{c.assessment_year_end}
          </div>
        )}
      </div>

      <VerticalThermometer
        score={score}
        sectorMedian={median}
        aboveMax={!!c.score_above_max_location}
        belowMin={!!c.score_below_min_location}
        height={132}
        showValue={false}
      />
    </div>
  );
}
