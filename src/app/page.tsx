import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroScale } from "@/components/HeroScale";
import { getScores } from "@/lib/scores";

export const dynamic = "force-dynamic";

const btnPrimary =
  "inline-flex rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90";
const btnSecondary =
  "inline-flex rounded-md border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-muted";

export default async function HomePage() {
  const scores = await getScores();
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
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/scores" className={btnPrimary}>
              Explore scores
            </Link>
            <Link href="/methodology" className={btnSecondary}>
              How it works
            </Link>
          </div>
          <HeroScale scores={scores} />
        </section>

        {/* What the number means */}
        <section className="grid gap-6 border-t border-border py-16 md:grid-cols-[1fr_1.6fr] md:gap-12">
          <h2 className="text-2xl font-bold tracking-tight">
            What the number means
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            A score of 2.7°C means that if the whole world cut emissions at that
            company&apos;s pace, warming would head toward about 2.7°C. It&apos;s
            global average warming above pre-industrial levels, the same scale as
            the Paris 1.5°C and 2°C goals.
          </p>
        </section>

        {/* About */}
        <section className="grid gap-6 border-t border-border py-16 md:grid-cols-[1fr_1.6fr] md:gap-12">
          <h2 className="text-2xl font-bold tracking-tight">
            Independent, and not for sale.
          </h2>
          <div>
            <p className="leading-relaxed text-muted-foreground">
              ThermoStat scores what companies have actually done to cut their
              emissions, and takes no money from the companies it scores.
              It&apos;s a free, public project with one aim: give anyone a
              straight, comparable read on climate performance, so action counts
              for more than announcements.
            </p>
            <Link href="/about" className={`${btnSecondary} mt-6`}>
              About ThermoStat
            </Link>
          </div>
        </section>

        {/* How a company becomes a temperature */}
        <section className="grid gap-6 border-t border-border py-16 md:grid-cols-[1fr_1.6fr] md:gap-12">
          <h2 className="text-2xl font-bold tracking-tight">
            How a company becomes a temperature
          </h2>
          <div>
            <p className="leading-relaxed text-muted-foreground">
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
            <Link href="/methodology" className={`${btnSecondary} mt-6`}>
              The full methodology
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
