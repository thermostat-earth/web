import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CompanyDetail } from "@/components/CompanyDetail";
import { getCompany } from "@/lib/company";

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
  const data = await getCompany(id);
  if (!data) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <CompanyDetail data={data} />
      </main>
      <SiteFooter />
    </>
  );
}
