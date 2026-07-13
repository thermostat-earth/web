import Link from "next/link";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/scores", label: "Scores" },
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-1.5 font-semibold tracking-tight">
          <Logo size={26} />
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
