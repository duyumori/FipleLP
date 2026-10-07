import { useT } from "../lib/i18n";
import { SectionRule, frame, lead } from "../lib/ui";

/** The positioning line, given the whole stage — no cards, just the statement. */
export function UseCasesSection() {
  const t = useT();
  return (
    <section className={`${frame} pb-32 max-sm:pb-20`}>
      <SectionRule index="04" label={t.useCases.eyebrow} />
      <div className="mt-10 grid grid-cols-12 items-end gap-x-6 gap-y-8">
        <h2 className="col-span-9 font-display text-[clamp(48px,8.4vw,132px)] leading-[0.9] font-light tracking-[-0.03em] text-ink max-[940px]:col-span-12">
          {t.useCases.title}
        </h2>
        <p className={`${lead} col-span-3 col-start-10 pb-[0.4em] max-[940px]:col-span-12 max-[940px]:col-start-1 max-[940px]:max-w-[440px]`}>
          {t.useCases.subtitle}
        </p>
      </div>
    </section>
  );
}
