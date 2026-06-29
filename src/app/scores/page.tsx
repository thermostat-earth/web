import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScoresExplorer } from "@/components/ScoresExplorer";
import { getScores } from "@/lib/scores";

export const dynamic = "force-dynamic";

export default async function ScoresPage() {
  const scores = await getScores();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Scores</h1>
        <p className="mt-2 text-muted-foreground">
          Temperature alignment scores based on achieved emissions reductions.
        </p>
        <div className="mt-8">
          <ScoresExplorer scores={scores} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
