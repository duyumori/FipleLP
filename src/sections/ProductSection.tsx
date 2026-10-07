import { useT } from "../lib/i18n";
import { SectionRule, frame, h2, meta } from "../lib/ui";

export function ProductSection() {
  const t = useT();
  return (
    <section className={`${frame} scroll-mt-20 pb-32 max-sm:pb-20`} id="product">
      <SectionRule index="03" label={t.product.eyebrow} />
      <h2 className={`${h2} mt-10 max-w-[1000px]`}>{t.product.title}</h2>

      {/* Editorial index instead of a card grid: one hairline row per capability */}
      <ul className="mt-16 border-b border-ink/15 max-sm:mt-10">
        {t.product.features.map(({ title, body }, i) => (
          <li
            key={i}
            className="group grid grid-cols-12 items-baseline gap-x-6 gap-y-2 border-t border-ink/15 py-8 max-sm:py-6"
          >
            <span className={`${meta} col-span-1 text-muted max-[940px]:col-span-12`}>{String(i + 1).padStart(2, "0")}</span>
            <h3 className="col-span-5 font-display text-[clamp(28px,3.2vw,46px)] leading-[1] font-light tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-muted max-[940px]:col-span-12">
              {title}
            </h3>
            <p className="col-span-5 col-start-8 max-w-[520px] text-[17px] leading-[1.45] font-light text-ink2 max-[940px]:col-span-12 max-[940px]:col-start-1 max-sm:text-[16px]">
              {body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
