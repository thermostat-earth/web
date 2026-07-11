import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScoresView } from "@/components/ScoresView";
import { getScores } from "@/lib/scores";

export const dynamic = "force-dynamic";

export default async function ScoresPage() {
  const scores = await getScores();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Scores</h1>
        <div className="mt-2">
          <ScoresView scores={scores} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
