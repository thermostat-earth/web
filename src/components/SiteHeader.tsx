"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/scores", label: "Scores" },
  { href: "/about", label: "About" },
  { href: "/methodology", label: "Methodology" },
  { href: "/impacts", label: "Impacts" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-1.5 font-semibold tracking-tight"
        >
          <Logo size={26} />
          ThermoStat
        </Link>

        {/* inline nav on wider screens */}
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-foreground">
              {n.label}
            </Link>
          ))}
        </nav>

        {/* hamburger on phone */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="-mr-1 inline-flex items-center justify-center p-2 text-muted-foreground hover:text-foreground sm:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {/* phone dropdown */}
      {open && (
        <nav className="border-t border-border px-6 py-2 sm:hidden">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm text-muted-foreground hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
