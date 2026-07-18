import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PaceArt } from "@/components/HomeArt";

export const metadata = {
  title: "About — ThermoStat",
  description:
    "ThermoStat's mission, the problem it solves, how it works, its principles, and who's behind it.",
};

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const DIFFERENTIATORS = [
  {
    icon: (
      <Glyph>
        <line x1="6" y1="6" x2="6" y2="18" />
        <line x1="12" y1="6" x2="12" y2="18" />
        <line x1="18" y1="6" x2="18" y2="18" />
      </Glyph>
    ),
    title: "One method, applied the same way.",
    body: "The same approach runs across every company, so comparisons between companies and sectors hold up.",
  },
  {
    icon: (
      <Glyph>
        <path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0z" />
      </Glyph>
    ),
    title: "A unit people already understand.",
    body: "The climate and its impacts are most commonly measured in degrees. ThermoStat puts company performance in the same unit, so there is nothing to translate.",
  },
  {
    icon: (
      <Glyph>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.5l2.5 2.5 4.5-5" />
      </Glyph>
    ),
    title: "Based on results.",
    body: "The score reflects what a company has reported and cut so far. Targets and pledges do not move it.",
  },
  {
    icon: (
      <Glyph>
        <circle cx="11" cy="11" r="6" />
        <line x1="20" y1="20" x2="15.5" y2="15.5" />
      </Glyph>
    ),
    title: "You can check the working.",
    body: "Every score shows the methodology, its scope, version, and the years it covers.",
  },
  {
    icon: (
      <Glyph>
        <path d="M12 6.5C10 5.2 7 5.2 5 6.5v11c2-1.3 5-1.3 7 0 2-1.3 5-1.3 7 0v-11c-2-1.3-5-1.3-7 0z" />
        <line x1="12" y1="6.5" x2="12" y2="17.5" />
      </Glyph>
    ),
    title: "Free to read.",
    body: "Anyone can read the scores at no cost.",
  },
];

const PRINCIPLES = [
  {
    icon: (
      <Glyph>
        <path d="M12 3l9 5-9 5-9-5 9-5z" />
        <path d="M3 13l9 5 9-5" />
      </Glyph>
    ),
    title: "Climate performance is contextual.",
    body: "A temperature score is one factual measure, not a company's whole story. How much weight it deserves depends on what you are willing to accept in the context of its wider environmental, social and financial sustainability performance, and how this compares to other companies in the sector and beyond. We give you the climate number; the broader judgement is yours.",
  },
  {
    icon: (
      <Glyph>
        <path d="M5 5h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H10l-4 3v-3H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
        <line x1="8" y1="10" x2="16" y2="10" />
      </Glyph>
    ),
    title: "No loaded words.",
    body: "You will not see “good”, “bad”, or “leading”. Just the number and how we reached it.",
  },
  {
    icon: (
      <Glyph>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7.5V12l3 2" />
      </Glyph>
    ),
    title: "Tied to time and scope.",
    body: "Every figure states the years and the boundaries it covers. We determine the required scope by including any emissions category deemed relevant and material, in line with the principles of the GHG Protocol.",
  },
  {
    icon: (
      <Glyph>
        <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
        <circle cx="12" cy="12" r="2.6" />
      </Glyph>
    ),
    title: "Methodology in the open.",
    body: "It is published, versioned, and shown on every page.",
  },
  {
    icon: (
      <Glyph>
        <path d="M4 20l1-4L15 6l3 3L8 19l-4 1z" />
        <line x1="13.5" y1="7.5" x2="16.5" y2="10.5" />
      </Glyph>
    ),
    title: "Corrections welcome.",
    body: "If a company can show us better data, we update the score.",
  },
];

function FeatureList({
  items,
}: {
  items: { icon: React.ReactNode; title: string; body: string }[];
}) {
  return (
    <ul className="mt-6 space-y-5">
      {items.map((it) => (
        <li key={it.title} className="flex gap-4">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground/80">
            {it.icon}
          </span>
          <div className="leading-relaxed">
            <div className="font-medium text-foreground">{it.title}</div>
            <p className="mt-1 text-muted-foreground">{it.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

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
              <div className="flex justify-center py-3">
                <PaceArt className="w-full max-w-[420px]" />
              </div>
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
            <FeatureList items={DIFFERENTIATORS} />
          </section>

          {/* Our principles */}
          <section>
            <h2 className="text-xl font-semibold tracking-tight">
              Our principles
            </h2>
            <FeatureList items={PRINCIPLES} />
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
