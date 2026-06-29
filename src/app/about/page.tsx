import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">About</h1>
        <p className="mt-4 text-muted-foreground">
          ThermoStat is a free, public climate-data project at thermostat.earth.
          All underlying data and sources are published for full transparency.
          More here soon.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
