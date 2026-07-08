"use client";

import { useState } from "react";

// Small ⓘ marker that reveals a plain-English definition on hover (desktop) or
// tap (mobile). Sits inline next to jargon like Scope 1/2/3.
export function InfoTip({ text, label = "More information" }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block align-middle">
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-muted-foreground/50 font-sans text-[9px] font-semibold leading-none text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-30 mb-1.5 w-52 -translate-x-1/2 rounded-md border border-border bg-card p-2.5 text-left text-xs font-normal leading-relaxed text-muted-foreground shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}

// Reusable definitions for the recurring terms.
export const GLOSSARY = {
  scope1:
    "Direct emissions from sources a company owns or controls — fuel burned on-site or in company vehicles.",
  scope2:
    "Indirect emissions from the energy a company buys, mainly purchased electricity, heat and steam.",
  scope3:
    "All other indirect emissions across a company's value chain, from suppliers to the use of its products. Usually the largest share.",
  location:
    "Location-based counts the emissions of the physical electricity grid a company draws from.",
  market:
    "Market-based counts the energy a company contractually buys, such as renewable-energy certificates or green tariffs.",
  window:
    "The recent run of consecutive years, with complete reporting, that a score is based on.",
} as const;
