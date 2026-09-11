import { completenessCount, type Completeness } from "@/lib/completeness";

/**
 * How much of a company's scope 3 the score covers, as a row of blocks.
 *
 * Felix, 2026-09-11: "I think we can do a better display for how many categories are missing, some
 * sort of visual representation on the cards that make it more clear."
 *
 * WHY BLOCKS AND NOT A BAR OR A PERCENTAGE. A bar is a proportion, and a proportion invites the
 * reader to treat 10 of 12 as "86% — nearly there". It is not nearly there if the two missing
 * categories are purchased goods and use of sold products, which for a tech company average 42%
 * and 21% of scope 3 between them. We cannot know what a company did not disclose, so anything
 * shaped like a percentage is making a claim we have no basis for. Discrete blocks say "twelve
 * things, ten of them covered" and make no claim about size at all. It is the same reason the
 * number beside it is written 10 of 12 rather than 83%.
 *
 * WHY THREE STATES AND NOT TWO. Felix was explicit that a category a company does not report and
 * one that simply has not been reported for long enough are different findings and must never
 * collapse into one count. So a hollow block outlined in amber is a disclosure the company is not
 * making; a faint hollow block is time that has not passed yet and will fix itself.
 *
 * IT CANNOT CONTRADICT THE NUMBER NEXT TO IT. The two totals come from what the scorer wrote at the
 * moment it summed those categories. The per-reason split is derived live, so where the two do not
 * add up — a company frozen mid-review while its figures moved on — every missing block falls back
 * to one neutral style rather than drawing a breakdown that disagrees with its own total.
 */
export function CoverageMeter({
  completeness,
  showLabel = true,
}: {
  completeness: Completeness;
  showLabel?: boolean;
}) {
  const total = completeness.categories_in_boundary;
  const covered = completeness.categories_in_window;
  const missing = Math.max(0, total - covered);

  // Worst first: a category never disclosed, then one withdrawn, then one that is merely young.
  const notDisclosed =
    (completeness.categories_not_reported ?? 0) + (completeness.categories_stopped ?? 0);
  const shortHistory = completeness.categories_short_history ?? 0;
  const splitAddsUp = notDisclosed + shortHistory === missing;

  const blocks: Array<"covered" | "not-disclosed" | "short" | "missing"> = [
    ...Array<"covered">(covered).fill("covered"),
    ...(splitAddsUp
      ? [
          ...Array<"not-disclosed">(notDisclosed).fill("not-disclosed"),
          ...Array<"short">(shortHistory).fill("short"),
        ]
      : Array<"missing">(missing).fill("missing")),
  ];

  const style: Record<string, string> = {
    covered: "bg-foreground/70",
    "not-disclosed": "border border-amber-500/80 bg-amber-500/10",
    short: "border border-muted-foreground/40",
    missing: "border border-muted-foreground/40",
  };

  // One sentence for a screen reader, and for anyone who cannot tell the blocks apart. Never rely
  // on the colour alone to carry a fact.
  const described = [
    `${completenessCount(completeness)} scope 3 categories reported for every year we score`,
    splitAddsUp && notDisclosed > 0 ? `${notDisclosed} not disclosed` : null,
    splitAddsUp && shortHistory > 0 ? `${shortHistory} without enough years yet` : null,
  ]
    .filter(Boolean)
    .join("; ");

  return (
    <div className="mt-2" aria-label={described} title={described}>
      {/* One row, never wrapped. Fifteen blocks at 8px plus a 2px gap is 148px, which fits the
          narrowest card. At 10px they wrapped and left an orphan block on a second line, which
          read as a separate thing rather than as part of the same count. */}
      <div className="flex flex-nowrap gap-[2px]" role="presentation">
        {blocks.map((kind, i) => (
          <span key={i} className={`h-2 w-2 shrink-0 rounded-[2px] ${style[kind]}`} />
        ))}
      </div>
      {/* THE COUNT AND THE BREAKDOWN ARE TWO LINES, not one wrapped one. Felix, 2026-09-11: "Can we
          put the '2 not reported' on the line below please". Run together they broke mid-phrase on
          a narrow card — "7 of 9 reported · 2 not / disclosed" — which reads as a stray fragment
          rather than as the second half of a sentence. On its own line the breakdown is also free
          to carry both reasons without pushing the card taller by another wrap, so the first line
          gets the word "categories" back. Each reason takes its own line rather than sharing one
          with a separator: Amazon has both, and joined up they wrapped again as "9 too few /
          years", which is the same fault one level down. Only one card is a line taller for it. */}
      {showLabel && (
        <div className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
          <div>{completenessCount(completeness)} categories reported</div>
          {splitAddsUp && notDisclosed > 0 && (
            <div className="text-amber-600 dark:text-amber-500">{notDisclosed} not disclosed</div>
          )}
          {splitAddsUp && shortHistory > 0 && <div>{shortHistory} too few years</div>}
        </div>
      )}
    </div>
  );
}
