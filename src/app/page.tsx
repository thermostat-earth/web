import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScoreCard } from "@/components/ScoreCard";
import { getScores } from "@/lib/scores";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const scores = await getScores();
  const sample = scores.slice(0, 4);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        <section className="py-20">
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Compare climate performance — based on reality, not promises.
          </h1>
          <p className="mt-6 max-w-2xl text-muted-foreground">
            ThermoStat turns a company&apos;s achieved emissions into a single
            temperature — the global warming outcome if the whole world moved at
            their pace. Descriptive, based on what&apos;s been done, not what&apos;s
            been pledged.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/scores"
              className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background"
            >
              Explore scores
            </Link>
            <Link
              href="/methodology"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
            >
              How it works
            </Link>
          </div>
        </section>

        <section className="pb-10">
          <h2 className="mb-5 text-sm font-medium text-muted-foreground">
            Sample scores
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sample.map((c) => (
              <ScoreCard key={c.company_id} c={c} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
