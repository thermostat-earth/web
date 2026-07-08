"use client";

import { useRef, useState } from "react";

// Small ⓘ marker that reveals a plain-English definition on hover (desktop) or
// tap (mobile). The tooltip is fixed-positioned so it can't be clipped by a
// scrolling/overflow container (e.g. a table wrapper).
export function InfoTip({ text, label = "More information" }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const ref = useRef<HTMLButtonElement>(null);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ left: r.left + r.width / 2, top: r.bottom + 6 });
    setOpen(true);
  };
  const hide = () => setOpen(false);

  return (
    <span className="inline-block align-middle">
      <button
        ref={ref}
        type="button"
        aria-label={label}
        onClick={() => (open ? hide() : show())}
        onMouseEnter={show}
        onMouseLeave={hide}
        onBlur={hide}
        className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-muted-foreground/50 font-sans text-[9px] font-semibold leading-none text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
      >
        i
      </button>
      {open && pos && (
        <span
          role="tooltip"
          style={{ position: "fixed", left: pos.left, top: pos.top, transform: "translateX(-50%)" }}
          className="z-50 w-52 rounded-md border border-border bg-card p-2.5 text-left text-xs font-normal leading-relaxed text-muted-foreground shadow-lg"
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
