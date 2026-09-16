import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CompanyDetail } from "@/components/CompanyDetail";
import { getCompany } from "@/lib/company";
import { getBrandsFor } from "@/lib/scores";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getCompany(id);
  if (!data) return { title: "Company not found · ThermoStat" };
  return {
    title: `${data.header.company_name} · ThermoStat`,
    description: `Emissions trajectory and temperature alignment for ${data.header.company_name}.`,
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, brands] = await Promise.all([getCompany(id), getBrandsFor(id)]);
  if (!data) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 py-12 pl-6 pr-10 sm:pl-8 sm:pr-16">
        <CompanyDetail data={data} />

        {/* WHAT THIS SCORE COVERS.
            The other half of making brands findable. Search gets someone here from a brand name;
            this tells someone who arrived at the parent what is inside the number. Only brands
            Felix has confirmed are readable at all, so an empty list means nothing was agreed
            rather than nothing was looked for — which is why it renders nothing rather than an
            empty heading. */}
        {brands.length > 0 && (
          <section className="mt-12 rounded-lg border border-border bg-card p-6">
            <h2 className="text-sm font-medium">This score covers</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {brands.map((b) => (
                <span key={b} className="rounded-full border border-border px-3 py-1 text-xs">
                  {b}
                </span>
              ))}
            </div>
            <p className="mt-3 max-w-[62ch] text-xs text-muted-foreground">
              Brands that trade under their own name and whose emissions are inside what{" "}
              {data.header.company_name} reported. They do not have separate scores — this one covers them.
            </p>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
