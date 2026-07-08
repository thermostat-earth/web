import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto max-w-4xl px-6 py-10 text-center text-xs text-muted-foreground">
        <div className="flex justify-center gap-5">
          <Link href="/methodology" className="hover:text-foreground">
            Methodology
          </Link>
          <Link href="/why" className="hover:text-foreground">
            Why?
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
        </div>
        <p className="mx-auto mt-5 max-w-2xl leading-relaxed">
          ThermoStat ranks companies using their own published emissions data.
          Scores reflect one factual measure — achieved emissions versus IPCC
          pathways — and are not financial advice, an endorsement, or a judgement
          of a company&apos;s overall sustainability performance. Spotted an
          error? Tell us.
        </p>
        <p className="mt-4">© 2026 ThermoStat</p>
      </div>
    </footer>
  );
}
