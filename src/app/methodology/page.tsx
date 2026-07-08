import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = {
  title: "Methodology · ThermoStat",
  description:
    "How ThermoStat turns a company's achieved emissions trajectory into a single temperature versus IPCC AR6 pathways.",
};

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 mb-3 text-xl font-semibold tracking-tight">{children}</h2>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs text-muted-foreground">
        {n}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

function Choice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Methodology</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          ThermoStat measures how fast a company has{" "}
          <span className="italic text-foreground">actually</span> cut (or
          increased) its emissions, and finds the global climate pathway moving at
          the same pace. It then expresses that as a single temperature for easy
          comparison.
        </p>

        <div className="mt-6 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          ThermoStat ranks companies using their own published emissions data. A
          score reflects one factual measure: how achieved emissions compare with
          IPCC pathways. It is not a judgement of overall sustainability
          performance, and not an endorsement.
        </div>

        <H2>The principle: reality, not promises</H2>
        <p className="text-sm text-muted-foreground">
          Most climate ratings reward commitments: net-zero targets, pledges,
          intentions. ThermoStat ignores all of that. We look only at the
          emissions a company has already reported (Scope 1, 2 and 3), and ask one
          question: how does the pace of those real reductions compare with the
          IPCC&apos;s modelled pathways to different temperatures?
        </p>

        <H2>How a score is built</H2>
        <div className="mt-6 flex flex-col gap-5">
          <Step n={1} title="Find a multi-year window">
            We use the most recent run of at least three consecutive years of
            usable data. A score is always a trend over time, never a single year.
          </Step>
          <Step n={2} title="Decide what counts">
            For each company we identify which Scope 3 categories are material to
            it. A member of our team reviews this to make sure every relevant
            category is included. A year only counts if Scope 1, Scope 2 and all
            material Scope 3 categories are reported. Companies that don&apos;t
            report enough are shown as &ldquo;not yet scored&rdquo; rather than
            guessed at.
          </Step>
          <Step n={3} title="Measure the trajectory, not the size">
            We index each year&apos;s total emissions to the first year of the
            window (set to 100). This captures how much a company has cut,
            independent of its size. It stops a company&apos;s sheer scale from
            skewing how its pace lines up against the global temperature pathways.
          </Step>
          <Step n={4} title="Add up the trajectory">
            We sum those year-by-year figures, each measured against the
            company&apos;s own base year. Because every year is relative to that
            starting point, this captures how steeply emissions fell (or rose),
            not how large the company is.
          </Step>
          <Step n={5} title="Do the same for every IPCC pathway">
            We repeat the exact same maths for each of 27 IPCC AR6 temperature
            pathways, from 1.4°C to 4.0°C, over the same years.
          </Step>
          <Step n={6} title="Match and interpolate">
            We find the two IPCC pathways whose pace brackets the company&apos;s
            own, and interpolate between their temperatures to land on a precise
            score.
          </Step>
        </div>

        <H2>The temperature scale (1.4°C to 4.0°C)</H2>
        <p className="text-sm text-muted-foreground">
          The scale runs from 1.4°C, the most ambitious IPCC pathway, to 4.0°C.
          The 4.0°C ceiling is not arbitrary. It is the warmest pathway the IPCC
          AR6 scenario database defines robustly. A company whose trajectory is
          hotter than the 4.0°C pathway is shown as &ldquo;&gt;4.0°C&rdquo;,
          meaning it is beyond the top of the modelled scale rather than a precise
          figure. A company outperforming the 1.4°C pathway is shown as
          &ldquo;&lt;1.4°C&rdquo;.
        </p>

        <H2>Location vs market-based</H2>
        <p className="text-sm text-muted-foreground">
          Scope 2 emissions come from the electricity a company buys, and can be
          measured two ways.{" "}
          <span className="text-foreground">Location-based</span> reflects the
          average emissions of the physical grid a company actually draws power
          from. <span className="text-foreground">Market-based</span> reflects the
          energy contracts it chooses to buy, such as renewable-energy
          certificates or green tariffs. A company can look cleaner on a market
          basis simply by buying certificates, so ThermoStat headlines the
          location-based figure as the more physically grounded measure. Both are
          available.
        </p>

        <H2>How confident the fit is</H2>
        <p className="text-sm text-muted-foreground">
          Each IPCC pathway is a band, not a line: a 10th to 90th percentile range
          of scenarios. Where a company&apos;s trajectory falls comfortably inside
          that band, the fit is strong. Where it falls outside, we record how far,
          so the confidence behind each score is transparent.
        </p>

        <H2>The choices we&apos;ve made (and why)</H2>
        <div className="mt-3 flex flex-col gap-4">
          <Choice title="We score achieved reductions, not absolute emissions.">
            A large emitter cutting quickly can score better than a small one
            standing still. We are describing the direction and speed of travel.
          </Choice>
          <Choice title="Each company has its own base year.">
            We index each to the first year of its own most recent complete
            reporting run, rather than forcing one shared base year. That lets us
            assess every company on its most recent, accurate data, and fairly
            compare firms reporting over different timelines. What we compare is
            alignment (which pathway their pace matches), not absolute tonnes.
          </Choice>
          <Choice title="Incomplete reporting means no score.">
            We would rather show &ldquo;not yet scored&rdquo; than estimate missing
            data and risk being wrong.
          </Choice>
          <Choice title="Every figure is sourced.">
            Each company page links to the company&apos;s own published reports, so
            you can check our inputs.
          </Choice>
        </div>

        <H2>Sources &amp; corrections</H2>
        <p className="text-sm text-muted-foreground">
          All data is drawn from companies&apos; own published reports, linked on
          each company page. If you believe a figure is wrong or out of date,{" "}
          <a
            href="mailto:hello@thermostat.earth"
            className="text-foreground underline underline-offset-4"
          >
            get in touch
          </a>{" "}
          and we will review it. Accuracy and transparency are the whole point.
        </p>

        <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          ThermoStat ranks companies using their own published emissions data,
          comparing achieved emissions against IPCC pathways. Scores are one
          factual measure, not financial advice, an endorsement, or a judgement of
          a company&apos;s overall sustainability performance.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
