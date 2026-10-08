import type React from "react";

// Shared editorial type scale — the same rhythm the hero sets: 24px gutters,
// oversized light headlines, tiny uppercase meta text, hairline rules.

export const frame = "px-6 max-sm:px-4";
export const meta = "font-mono text-[11px] font-normal tracking-[0.06em] uppercase";
export const h2 =
  "font-display text-[clamp(40px,5.4vw,84px)] leading-[0.95] font-light tracking-[-0.025em] text-ink";
export const lead = "text-[19px] leading-[1.4] font-light text-ink2 max-sm:text-[17px]";

/** Hairline that opens every section: index on the left, label on the right. */
export function SectionRule({
  index,
  label,
  dark = false,
  bare = false,
}: {
  index: string;
  label: string;
  dark?: boolean;
  /** No hairline — for when the section above already closes with a line (e.g. a Bracket). */
  bare?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${bare ? "" : "border-t pt-4"} ${meta} ${
        dark ? "border-white/20 text-white/55" : "border-ink/15 text-muted"
      }`}
    >
      <span>{index}</span>
      <span>{label}</span>
    </div>
  );
}

/** Small mono body copy used on the dark inner pages (topology's Space Mono paragraphs). */
export const monoBody = "font-mono text-[14px] leading-[1.55] text-ink/70";

/**
 * Text that settles word by word when it scrolls into view (see [data-reveal="words"] in
 * index.css). `delay` offsets the whole run, in ms.
 */
export function RevealWords({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span data-reveal="words" className={className} style={{ "--d": `${delay}ms` } as React.CSSProperties}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="w" style={{ "--i": i } as React.CSSProperties}>
            {w}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

/** The bracketed hairline frame (hooked corners) used around the footer, lists and media. */
export function Bracket({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="h-[6px] rounded-t-[4px] border-x border-t border-ink/25" aria-hidden="true" />
      {children}
      <div className="h-[6px] rounded-b-[4px] border-x border-b border-ink/25" aria-hidden="true" />
    </div>
  );
}
