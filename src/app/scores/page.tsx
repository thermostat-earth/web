import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScoresView } from "@/components/ScoresView";
import { getScores, getBrands } from "@/lib/scores";
import { getCompleteness } from "@/lib/completeness";

export const dynamic = "force-dynamic";

export default async function ScoresPage() {
  // Both in one round trip. The tag is not on company_scores_public on purpose: it is derived from
  // the line positions and never stored, so there is no way for a stored tag to contradict the lines
  // it claims to summarise.
  const [scores, completeness, brands] = await Promise.all([getScores(), getCompleteness(), getBrands()]);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Scores</h1>
        <div className="mt-2">
          <ScoresView scores={scores} completeness={Object.fromEntries(completeness)} brands={brands} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
