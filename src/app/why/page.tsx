import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function WhyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">The Why</h1>
        <p className="mt-4 text-muted-foreground">
          Pledges are easy; reductions are hard. ThermoStat measures what a
          company has actually achieved, translated into a temperature everyone
          understands — to hold climate performance to account in plain terms.
          Fuller text coming as we rebuild this page.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
