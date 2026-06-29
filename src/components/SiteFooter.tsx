import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-muted-foreground">
        <p>
          Scores update automatically when new data is added. Methodology v1 ·
          IPCC AR6 · Scope 1, 2 &amp; 3.
        </p>
        <div className="mt-3 flex justify-center gap-5">
          <Link href="/methodology" className="hover:text-foreground">
            Methodology
          </Link>
          <Link href="/why" className="hover:text-foreground">
            The Why
          </Link>
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
        </div>
        <p className="mt-4">© 2026 ThermoStat</p>
      </div>
    </footer>
  );
}
