import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScoreCard } from "@/components/ScoreCard";
import { HeroScale } from "@/components/HeroScale";
import { getScores } from "@/lib/scores";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const scores = await getScores();
  const examples = [...scores].sort(
    (a, b) =>
      (a.thermostat_score_location ?? 99) - (b.thermostat_score_location ?? 99),
  );
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        {/* Hero */}
        <section className="py-20">
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Compare climate performance based on reality, not promises.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            ThermoStat turns a company&apos;s real emissions record into a single
            climate temperature score, in °C.
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

          <HeroScale scores={scores} />
        </section>

        {/* What the number means */}
        <section className="border-t border-border py-14">
          <h2 className="text-xl font-semibold tracking-tight">
            What the number means
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
            A score of 2.7°C means that if the whole world cut emissions at that
            company&apos;s pace, warming would head toward about 2.7°C. It&apos;s
            global average warming above pre-industrial levels, the same scale as
            the Paris 1.5°C and 2°C goals.
          </p>
        </section>

        {/* Example scores */}
        <section className="border-t border-border py-14">
          <h2 className="text-xl font-semibold tracking-tight">Example scores</h2>
          <div className="mt-6 grid max-w-3xl gap-6 sm:grid-cols-2">
            {examples.map((c) => (
              <Link
                key={c.company_id}
                href={`/company/${c.company_id}`}
                className="block transition hover:opacity-90"
              >
                <ScoreCard c={c} />
              </Link>
            ))}
          </div>
          <Link
            href="/scores"
            className="mt-6 inline-block text-sm font-medium text-foreground underline underline-offset-4"
          >
            See all scores →
          </Link>
        </section>

        {/* How a company becomes a temperature */}
        <section className="border-t border-border py-14">
          <div className="rounded-lg border border-border bg-card p-8">
            <h2 className="text-2xl font-bold tracking-tight">
              How a company becomes a temperature
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
              Every year, companies report their emissions in long documents that
              are hard to read and harder to compare. ThermoStat takes that
              public data, has a human check for what actually counts, and
              measures how fast a company has really cut its emissions over recent
              years. It then finds the global climate pathway moving at that same
              pace, and reports the temperature that pathway leads to. So instead
              of a stack of reports, you get one number you can line up against
              any other company, with every figure traceable to the source, and
              use it to understand real climate impacts.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
              <Link
                href="/about"
                className="text-foreground underline underline-offset-4"
              >
                About ThermoStat →
              </Link>
              <Link
                href="/methodology"
                className="text-foreground underline underline-offset-4"
              >
                The full methodology →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
