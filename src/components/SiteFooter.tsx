import Link from "next/link";

export function SiteFooter() {
  const build = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
  return (
    <footer className="mt-20 border-t border-border" data-build={build}>
      <div className="mx-auto max-w-4xl px-6 py-10 text-center text-xs text-muted-foreground">
        <div className="flex justify-center gap-5">
          <Link href="/methodology" className="hover:text-foreground">
            Methodology
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
        </div>
        <p className="mx-auto mt-5 max-w-2xl leading-relaxed">
          ThermoStat scores companies using their own published emissions data,
          comparing achieved emissions against IPCC pathways. Scores are one
          factual measure, not financial advice, an endorsement, or a judgement of
          a company&apos;s overall sustainability performance.
        </p>
        <p className="mt-4">© 2026 ThermoStat</p>
      </div>
    </footer>
  );
}
