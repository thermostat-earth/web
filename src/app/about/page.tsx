import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "About — ThermoStat",
  description:
    "ThermoStat turns a company's achieved emissions into a single temperature score — comparable, transparent, free and public.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        {/* Mission statement */}
        <p className="text-sm font-medium text-muted-foreground">About ThermoStat</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Corporate climate performance should be as easy to compare as the
          temperature itself.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          ThermoStat turns what a company has actually achieved into a single
          number — in degrees — so anyone can see how it measures up. Based on
          what&apos;s been done, not what&apos;s been pledged.
        </p>

        <div className="mt-14 space-y-14">
          {/* The problem */}
          <section>
            <h2 className="text-xl font-semibold tracking-tight">The problem</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">
              <p>
                Company climate performance isn&apos;t comparable. Emissions
                disclosures vary in scope, timeframe, and completeness — and
                consumer-facing claims describe ambition far more often than
                achievement.
              </p>
              <p>
                So a reader — a journalist, an investor, a sustainability lead, a
                procurement team, or simply a curious customer — has no quick,
                neutral way to see whether a company&apos;s real emissions
                trajectory lines up with a 1.5°C world.
              </p>
            </div>
          </section>

          {/* What we do */}
          <section>
            <h2 className="text-xl font-semibold tracking-tight">What we do</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">
              <p>
                ThermoStat converts a company&apos;s achieved emissions
                trajectory into a single temperature score, in °C — the global
                warming outcome if the whole world moved at their pace.
              </p>
              <p>
                Every score sits alongside its sector average, a transparent
                methodology, and an honest &ldquo;Unknown&rdquo; wherever the
                data won&apos;t support a number. It&apos;s free, public, and open
                to anyone who needs it.
              </p>
            </div>
          </section>

          {/* What makes it different */}
          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              What makes it different
            </h2>
            <ul className="mt-4 space-y-3 leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">
                  Comparable by construction.
                </span>{" "}
                The same method applied to every company, so company-to-company
                and sector-to-sector comparisons actually hold.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  A unit everyone already knows.
                </span>{" "}
                The climate is measured in degrees; ThermoStat brings the same
                unit to corporate performance — no translation layer.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Achievement, not ambition.
                </span>{" "}
                The score reflects what has been done, not what has been pledged.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Transparent by design.
                </span>{" "}
                The methodology, its version, and the time window are shown on
                every score.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Free and public.
                </span>{" "}
                All of it, for anyone who needs it.
              </li>
            </ul>
          </section>

          {/* Our principles */}
          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Our principles
            </h2>
            <ul className="mt-4 space-y-3 leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">
                  A description, not a verdict.
                </span>{" "}
                ThermoStat is not an ESG rating, a certification, a prediction,
                or a target validation. It reports what has happened — it
                doesn&apos;t pass judgement.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  No moral language.
                </span>{" "}
                No &ldquo;good&rdquo;, &ldquo;bad&rdquo;, or &ldquo;leading&rdquo;
                — just the number and the workings.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Anchored to time and scope.
                </span>{" "}
                Every figure states the years and boundaries it covers.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Methodology in the open.
                </span>{" "}
                Shown, versioned, and visible on every page.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Corrections welcome.
                </span>{" "}
                If a company can show us better data, we update the score.
              </li>
            </ul>
          </section>

          {/* Who's behind it */}
          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Who&apos;s behind it
            </h2>
            <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">
              <p>
                ThermoStat is built by Felix Edge-Partington. For version one,
                every company&apos;s Scope 3 emissions are reviewed by hand, with
                sampled audits across Scope 1 and 2 — so the numbers are checked
                by a person, not just a pipeline.
              </p>
              <p>
                It&apos;s independent and free to use, and takes no money from the
                companies it scores. ThermoStat is currently self-funded by its
                founder; a non-profit entity will be formed once the model is
                proven.
              </p>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
