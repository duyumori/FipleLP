// Shared editorial type scale — the same rhythm the hero sets: 24px gutters,
// oversized light headlines, tiny uppercase meta text, hairline rules.

export const frame = "px-6 max-sm:px-4";
export const meta = "font-mono text-[11px] font-normal tracking-[0.06em] uppercase";
export const h2 =
  "font-display text-[clamp(40px,5.4vw,84px)] leading-[0.95] font-light tracking-[-0.025em] text-ink";
export const lead = "text-[19px] leading-[1.4] font-light text-ink2 max-sm:text-[17px]";

/** Hairline that opens every section: index on the left, label on the right. */
export function SectionRule({ index, label, dark = false }: { index: string; label: string; dark?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between border-t pt-4 ${meta} ${
        dark ? "border-white/20 text-white/55" : "border-ink/15 text-muted"
      }`}
    >
      <span>{index}</span>
      <span>{label}</span>
    </div>
  );
}
