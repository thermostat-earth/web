import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "About — ThermoStat",
  description:
    "ThermoStat's mission, the problem it solves, how it works, its principles, and who's behind it.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        {/* Mission */}
        <p className="text-sm font-medium text-muted-foreground">About ThermoStat</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          Corporate climate performance should be easy for anyone to compare.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          ThermoStat&apos;s mission is to show how well companies are really
          cutting their emissions, and to communicate this in a way that allows
          anyone to consider climate performance.
        </p>

        <div className="mt-14 space-y-14">
          {/* The problem */}
          <section>
            <h2 className="text-xl font-semibold tracking-tight">The problem</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">
              <p>
                We are in a climate crisis, and most of the time, we can&apos;t
                even tell who is making it better, and who is making it worse.
              </p>
              <p>
                Company climate performance is incredibly hard to compare.
                Emissions disclosures cover different scopes and timeframes, and
                vary in how complete they are. And what companies say in public
                is often incomplete, focusing on what they plan to do, rather
                than what they have already done.
              </p>
              <p>
                There is no quick, neutral, easily accessible way for someone to
                see a company&apos;s real emissions path, and how that pathway
                lines up with the tangible impacts on our planet.
              </p>
            </div>
          </section>

          {/* What we do */}
          <section>
            <h2 className="text-xl font-semibold tracking-tight">What we do</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">
              <p>
                ThermoStat takes what a company has actually done to cut its
                emissions and turns it into a single climate temperature score,
                in °C. You can read that as the warming outcome if the whole
                world moved at that company&apos;s pace. You can then use that
                warming figure to understand what global warming impacts the
                company is aligned to.
              </p>
              <p>
                The temperature is a global figure, not the company&apos;s own.
                It refers to the rise in the world&apos;s average surface
                temperature above pre-industrial levels, the same measure used
                for the Paris Agreement goals of 1.5°C and 2°C. A score of 2.7°C
                does not mean the company warms the planet by 2.7°C on its own.
                It means that if the whole world cut emissions at that
                company&apos;s pace, warming would head toward about 2.7°C.
              </p>
              <p>
                Each score comes with its sector average, the methodology behind
                it, and a clear &ldquo;Unknown&rdquo; wherever the data will not
                support a number. The scores are free to read. Later on we may
                license deeper data or offer a premium version to help fund the
                work.
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
                  One method, applied the same way.
                </span>{" "}
                The same approach runs across every company, so comparisons
                between companies and sectors hold up.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  A unit people already understand.
                </span>{" "}
                The climate and its impacts are most commonly measured in
                degrees. ThermoStat puts company performance in the same unit, so
                there is nothing to translate.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Based on results.
                </span>{" "}
                The score reflects what a company has reported and cut so far.
                Targets and pledges do not move it.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  You can check the working.
                </span>{" "}
                Every score shows the methodology, its scope, version, and the
                years it covers.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Free to read.
                </span>{" "}
                Anyone can read the scores at no cost.
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
                  Climate performance is contextual.
                </span>{" "}
                A temperature score is one factual measure, not a company&apos;s
                whole story. How much weight it deserves depends on what you are
                willing to accept in the context of its wider environmental,
                social and financial sustainability performance, and how this
                compares to other companies in the sector and beyond. We give you
                the climate number; the broader judgement is yours.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  No loaded words.
                </span>{" "}
                You will not see &ldquo;good&rdquo;, &ldquo;bad&rdquo;, or
                &ldquo;leading&rdquo;. Just the number and how we reached it.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Tied to time and scope.
                </span>{" "}
                Every figure states the years and the boundaries it covers. We
                determine the required scope by including any emissions category
                deemed relevant and material, in line with the principles of the
                GHG Protocol.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Methodology in the open.
                </span>{" "}
                It is published, versioned, and shown on every page.
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
                ThermoStat is built by Felix Edge-Partington. Although AI is used
                to ingest publicly available emissions data, each year of a
                company&apos;s emissions figures goes through a review process
                where a human climate expert ensures all relevant Scope 3
                emissions categories have been included, and randomly samples the
                Scope 1, 2 and 3 figures.
              </p>
              <p>
                ThermoStat is independent and takes no money from the companies
                it scores. It is self-funded for now and free to read. Any paid
                income later would come from licensing data or a premium version,
                not from the companies being scored. The plan is to move it into
                a non-profit once the model is proven.
              </p>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
