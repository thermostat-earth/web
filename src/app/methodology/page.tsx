import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function MethodologyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Methodology</h1>
        <p className="mt-4 text-muted-foreground">
          Full write-up coming as we rebuild this page. In short: ThermoStat fits
          a company&apos;s achieved emissions trajectory (Scope 1, 2 &amp; 3)
          against IPCC AR6 pathways to derive a single alignment temperature — a
          description of the warming outcome implied by their pace, not a rating.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
