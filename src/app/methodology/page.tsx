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

export default function MethodologyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Methodology</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          ThermoStat measures how fast a company has{" "}
          <span className="text-foreground">actually</span> cut its emissions,
          and finds the global climate pathway moving at the same pace — then
          expresses it as a single temperature.
        </p>

        <div className="mt-6 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          A ThermoStat score is <span className="text-foreground">descriptive,
          not a rating or an endorsement</span>. It describes the warming outcome
          implied by a company&apos;s recent pace of decarbonisation if the world
          moved at that pace — based on emissions already reported, not on targets
          or pledges.
        </div>

        <H2>The principle: reality, not promises</H2>
        <p className="text-sm text-muted-foreground">
          Most climate ratings reward <em>commitments</em> — net-zero targets,
          pledges, intentions. ThermoStat ignores all of that. We look only at
          the emissions a company has <span className="text-foreground">already
          reported</span> (Scope 1, 2 and 3) and ask a single question: how does
          the pace of those real reductions compare to the IPCC&apos;s modelled
          pathways to different temperatures?
        </p>

        <H2>How a score is built</H2>
        <div className="mt-6 flex flex-col gap-5">
          <Step n={1} title="Find a multi-year window">
            We use the most recent run of at least{" "}
            <span className="text-foreground">three consecutive years</span> of
            usable data, ending recently. A score is always a trend over time —
            never a single year.
          </Step>
          <Step n={2} title="Decide what counts">
            For each company we identify which Scope 3 categories are material to
            it. A year only counts if Scope 1, Scope 2 and{" "}
            <span className="text-foreground">all material Scope 3 categories</span>{" "}
            are reported. Companies that don&apos;t report enough are shown as
            &ldquo;not yet scored&rdquo; rather than guessed at.
          </Step>
          <Step n={3} title="Measure the trajectory, not the size">
            We index each year&apos;s total emissions to the first year of the
            window (= 100). This captures <span className="text-foreground">how
            much a company has cut</span>, independent of how large it is.
          </Step>
          <Step n={4} title="Sum the company's path">
            Adding those indexed years together gives the company&apos;s
            cumulative emissions over the window — the lower the total, the
            deeper and faster the cuts.
          </Step>
          <Step n={5} title="Do the same for every IPCC pathway">
            We repeat the exact same maths for each of 27 IPCC AR6 temperature
            pathways (1.4°C to 4.0°C), over the same years.
          </Step>
          <Step n={6} title="Match and interpolate">
            We find the two pathways whose pace brackets the company&apos;s, and
            interpolate between them to land on a precise temperature — the
            score.
          </Step>
        </div>

        <H2>The temperature scale (1.4°C – 4.0°C)</H2>
        <p className="text-sm text-muted-foreground">
          The scale runs from <span className="text-foreground">1.4°C</span> (the
          most ambitious IPCC pathway) to <span className="text-foreground">4.0°C</span>.
          The 4.0°C ceiling is not arbitrary: it is the warmest pathway the IPCC
          AR6 scenario database defines robustly. A company whose trajectory is
          hotter than the 4.0°C pathway is shown as{" "}
          <span className="text-foreground">&ldquo;&gt;4.0°C&rdquo;</span> — meaning
          &ldquo;beyond the top of the modelled scale&rdquo;, not a precise figure.
          Likewise, a company outperforming the 1.4°C pathway is shown as
          &ldquo;&lt;1.4°C&rdquo;.
        </p>

        <H2>Location vs market-based</H2>
        <p className="text-sm text-muted-foreground">
          Scope 2 emissions can be counted two ways. ThermoStat computes both and
          shows the <span className="text-foreground">location-based</span> figure
          as the headline, because it reflects the physical grid a company draws
          from rather than the contracts it buys.
        </p>

        <H2>How confident the fit is</H2>
        <p className="text-sm text-muted-foreground">
          Each IPCC pathway is a band, not a line (a 10th–90th percentile range of
          scenarios). Where a company&apos;s trajectory falls comfortably inside
          that band, the fit is strong. Where it falls outside, we record how far
          — so the confidence behind each score is transparent.
        </p>

        <H2>The choices we&apos;ve made (and why)</H2>
        <p className="text-sm text-muted-foreground">
          Every methodology makes judgement calls. Here are ours, stated plainly:
        </p>
        <ul className="mt-3 flex flex-col gap-3 text-sm text-muted-foreground">
          <li>
            <span className="text-foreground">We score achieved reductions, not
            absolute emissions.</span> A large emitter cutting quickly can score
            better than a small one standing still. We&apos;re describing the{" "}
            <em>direction and speed</em> of travel.
          </li>
          <li>
            <span className="text-foreground">Scores are relative to a base year.</span>{" "}
            We use a consistent, automatically-selected recent window so the
            comparison is like-for-like across companies.
          </li>
          <li>
            <span className="text-foreground">Incomplete reporting means no
            score.</span> We would rather show &ldquo;not yet scored&rdquo; than
            estimate missing data and risk being wrong.
          </li>
          <li>
            <span className="text-foreground">Every figure is sourced.</span> Each
            company page links to the company&apos;s own published reports, so you
            can check our inputs.
          </li>
        </ul>

        <H2>Sources &amp; corrections</H2>
        <p className="text-sm text-muted-foreground">
          All data is drawn from companies&apos; own published reports, linked on
          each company page. If you believe a figure is wrong or out of date, tell
          us and we&apos;ll review it — accuracy and transparency are the whole
          point.
        </p>

        <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          ThermoStat is an independent, descriptive tool. Scores are not financial,
          investment or compliance advice, and are not a rating, ranking or
          endorsement of any company.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
