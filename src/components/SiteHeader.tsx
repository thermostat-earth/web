import Link from "next/link";

const NAV = [
  { href: "/scores", label: "Scores" },
  { href: "/methodology", label: "Methodology" },
  { href: "/why", label: "The Why" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight">
          ThermoStat
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
