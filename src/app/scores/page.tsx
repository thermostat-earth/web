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
        <p className="mt-2 text-muted-foreground">
          Every company on one temperature scale — coolest at the bottom. Switch to the dashboard for cards.
        </p>
        <div className="mt-10">
          <ScoresView scores={scores} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
