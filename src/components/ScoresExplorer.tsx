"use client";

import { useMemo, useState } from "react";
import { ScoreCard } from "@/components/ScoreCard";
import type { CompanyScore } from "@/lib/scores";

type SortKey = "low" | "high" | "name";

export function ScoresExplorer({ scores }: { scores: CompanyScore[] }) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All");
  const [sort, setSort] = useState<SortKey>("low");

  const sectors = useMemo(
    () => ["All", ...Array.from(new Set(scores.map((s) => s.sector))).sort()],
    [scores],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = scores.filter((s) => s.company_name.toLowerCase().includes(q));
    if (sector !== "All") rows = rows.filter((s) => s.sector === sector);
    const val = (s: CompanyScore) =>
      s.thermostat_score_location ?? Number.POSITIVE_INFINITY;
    return [...rows].sort((a, b) => {
      if (sort === "name") return a.company_name.localeCompare(b.company_name);
      return sort === "low" ? val(a) - val(b) : val(b) - val(a);
    });
  }, [scores, query, sector, sort]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search companies…"
          className="h-9 min-w-[200px] flex-1 rounded-md border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex flex-wrap gap-1">
          {sectors.map((s) => (
            <button
              key={s}
              onClick={() => setSector(s)}
              className={`rounded-full px-3 py-1.5 text-xs transition ${
                sector === s
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="h-9 rounded-md border border-border bg-card px-2 text-sm outline-none"
        >
          <option value="low">Score: Low → High</option>
          <option value="high">Score: High → Low</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No companies match.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <ScoreCard key={c.company_id} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}
