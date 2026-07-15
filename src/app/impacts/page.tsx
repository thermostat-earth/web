import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { scoreColor } from "@/lib/temperature";

export const metadata = {
  title: "What each temperature means for you — ThermoStat",
  description:
    "What global warming of 1.5, 2, 3 and 4°C means for everyday life: heat, floods, money and food.",
};

const BANDS = [1.5, 2, 3, 4];

type Source = { label: string; url?: string };

const METRICS: {
  title: string;
  caption: string;
  values: string[];
  you: string;
  sources: Source[];
}[] = [
  {
    title: "Heatwaves",
    caption: "The scorcher that used to come once a decade now comes…",
    values: ["every 2–3 years", "every 2 years", "most years", "almost every year"],
    you: "At 1.5°C, heat already kills thousands of people in the UK each year. At 4°C, that could pass 10,000 deaths a year by the 2050s, with many more days too hot to work or sleep.",
    sources: [
      {
        label: "UKHSA, 2023",
        url: "https://www.gov.uk/government/publications/climate-change-health-effects-in-the-uk",
      },
    ],
  },
  {
    title: "Flooding downpours",
    caption: "The deluge that used to come once a decade now comes…",
    values: ["~every 7 years", "~every 6 years", "~every 5 years", "~every 4 years"],
    you: "At 1.5°C, flooding and home-insurance costs are already climbing. At 4°C, some homes flood so often they become uninsurable. Even now, 1 in 4 English homes could be in a flood-risk area by 2050. Flood Re, the government-backed scheme that keeps flood insurance affordable for high-risk homes, does not cover homes built after 2009.",
    sources: [
      {
        label: "Environment Agency, 2024",
        url: "https://www.gov.uk/government/publications/national-assessment-of-flood-and-coastal-erosion-risk-in-england-2024",
      },
      { label: "Flood Re", url: "https://www.floodre.co.uk/" },
    ],
  },
  {
    title: "The economy",
    caption: "Lost out of every £100 the economy makes",
    values: ["about £2", "about £4", "about £9", "about £16"],
    you: "At 1.5°C the hit is real but modest; at 4°C it is roughly eight times bigger. Climate damage is already estimated to cost the average UK household around £3,000 a year, and it grows steeply with every degree.",
    sources: [
      { label: "OECD, 2025" },
      {
        label: "Global Witness, 2024",
        url: "https://globalwitness.org/en/press-releases/uk-households-facing-3000-climate-damage-costs-this-year/",
      },
      {
        label: "LSE Grantham",
        url: "https://www.lse.ac.uk/granthaminstitute/publication/what-will-climate-change-cost-the-uk/",
      },
    ],
  },
  {
    title: "Harvests",
    caption: "Staple crops yield…",
    values: ["a tenth less", "a seventh less", "a fifth less", "a third less"],
    you: "At 1.5°C, you see it in specific items like coffee, chocolate and olive oil, which are already spiking. At 4°C, staple crops yield a third less, so higher prices spread across your whole weekly shop.",
    sources: [
      {
        label: "Kotz et al., 2024",
        url: "https://www.nature.com/articles/s43247-023-01173-x",
      },
    ],
  },
];

export default function ImpactsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          What each temperature means for you
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          A company&apos;s climate temperature score points to one of these
          worlds. Here is what each level of global warming does to everyday
          life.
        </p>

        <div className="mt-12 space-y-6">
          {METRICS.map((m) => (
            <div key={m.title} className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight">{m.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{m.caption}</p>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {BANDS.map((b, i) => (
                  <div
                    key={b}
                    className="rounded-lg bg-background/60 p-3"
                    style={{ borderLeft: `3px solid ${scoreColor(b)}` }}
                  >
                    <div
                      className="font-mono text-sm font-semibold"
                      style={{ color: scoreColor(b) }}
                    >
                      {b}°C
                    </div>
                    <div className="mt-1 text-sm text-foreground">{m.values[i]}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-border pt-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  What this means for you
                </div>
                <p className="mt-2 leading-relaxed text-muted-foreground">{m.you}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {m.sources.length > 1 ? "Sources: " : "Source: "}
                  {m.sources.map((s, i) => (
                    <span key={s.label}>
                      {i > 0 && " · "}
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2 hover:text-foreground"
                        >
                          {s.label}
                        </a>
                      ) : (
                        s.label
                      )}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Bands are global average warming above pre-industrial levels. Figures
          are drawn from the sources shown (IPCC, OECD and others) and rounded to
          plain language; some human impacts are reported by year or scenario
          rather than by exact temperature, and are framed accordingly. This is an
          early version, and we will keep building it out.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
