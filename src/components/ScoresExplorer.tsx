"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ScoreCard } from "@/components/ScoreCard";
import type { CompanyScore, Brand } from "@/lib/scores";

type SortKey = "low" | "high" | "name";

export function ScoresExplorer({ scores, brands = [] }: { scores: CompanyScore[]; brands?: Brand[] }) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All");
  const [sort, setSort] = useState<SortKey>("low");

  const sectors = useMemo(
    () => ["All", ...Array.from(new Set(scores.map((s) => s.sector))).sort()],
    [scores],
  );

  // WHICH COMPANIES A SEARCH TERM REACHES THROUGH A BRAND.
  //
  // Typing "COS" has to find H&M Group, because COS is inside what H&M reported. The match is on the
  // brand name and the RESULT is still the parent — a brand never becomes a row of its own here, or
  // the page would imply COS was assessed separately and the site would appear to cover far more
  // companies than it does.
  const matchedBrands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return new Map<string, string[]>();
    const hits = new Map<string, string[]>();
    for (const b of brands) {
      if (!b.brand_name.toLowerCase().includes(q)) continue;
      hits.set(b.company_id, [...(hits.get(b.company_id) ?? []), b.brand_name]);
    }
    return hits;
  }, [brands, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = scores.filter(
      (s) => s.company_name.toLowerCase().includes(q) || matchedBrands.has(s.company_id),
    );
    if (sector !== "All") rows = rows.filter((s) => s.sector === sector);
    const val = (s: CompanyScore) =>
      s.thermostat_score_location ?? Number.POSITIVE_INFINITY;
    return [...rows].sort((a, b) => {
      if (sort === "name") return a.company_name.localeCompare(b.company_name);
      return sort === "low" ? val(a) - val(b) : val(b) - val(a);
    });
  }, [scores, query, sector, sort, matchedBrands]);

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
            <Link
              key={c.company_id}
              href={`/company/${c.company_id}`}
              className="block transition hover:opacity-90"
            >
              {/* Say WHY this result came back when it was reached through a brand. Without this line
                  someone searching COS sees a card headed "H&M Group" and reasonably thinks the
                  search is broken. It also has to be unambiguous that the score belongs to the
                  parent — this is the sentence that stops one score under two names reading as two
                  assessments, or as double counting. */}
              {matchedBrands.has(c.company_id) && (
                <p className="mb-1 text-xs text-muted-foreground">
                  {matchedBrands.get(c.company_id)!.join(", ")} —{" "}
                  {matchedBrands.get(c.company_id)!.length === 1 ? "part of" : "all part of"}{" "}
                  {c.company_name}, which reports emissions for the whole group.
                </p>
              )}
              <ScoreCard c={c} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
