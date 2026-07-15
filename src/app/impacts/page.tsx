import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { scoreColor } from "@/lib/temperature";

export const metadata = {
  title: "What each temperature means for you — ThermoStat",
  description:
    "What global warming of 1.5, 2, 3 and 4°C means for everyday life: heat, floods, money and food.",
};

const BANDS = [1.5, 2, 3, 4];

const METRICS = [
  {
    title: "Heatwaves",
    caption: "The scorcher that used to come once a decade now comes…",
    values: ["every 2–3 years", "every 2 years", "most years", "almost every year"],
    you: "At 1.5°C, heat already kills thousands of people in the UK each year. At 4°C, that could pass 10,000 deaths a year by the 2050s, with many more days too hot to work or sleep.",
    source: "UKHSA, 2023",
  },
  {
    title: "Flooding downpours",
    caption: "The deluge that used to come once a decade now comes…",
    values: ["~every 7 years", "~every 6 years", "~every 5 years", "~every 4 years"],
    you: "At 1.5°C, flooding and home-insurance costs are already climbing. At 4°C, some homes flood so often they become uninsurable. Even now, 1 in 4 English homes could be in a flood-risk area by 2050, and new-builds since 2009 aren't covered by the Flood Re scheme.",
    source: "Environment Agency, 2024; ABI / Flood Re",
  },
  {
    title: "The economy",
    caption: "Lost out of every £100 the economy makes",
    values: ["about £2", "about £4", "about £9", "about £16"],
    you: "At 1.5°C the hit is real but modest; at 4°C it is roughly eight times bigger. Climate damage is already estimated to cost the average UK household around £3,000 a year, and it grows steeply with every degree.",
    source: "OECD, 2025; Global Witness / LSE Grantham, 2024",
  },
  {
    title: "Harvests",
    caption: "Staple crops yield…",
    values: ["a tenth less", "a seventh less", "a fifth less", "a third less"],
    you: "At 1.5°C, you see it in specific items like coffee, chocolate and olive oil, which are already spiking. At 4°C, staple crops yield a third less, so higher prices spread across your whole weekly shop.",
    source: "Kotz et al., 2024",
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
                <p className="mt-2 text-xs text-muted-foreground">Source: {m.source}</p>
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
