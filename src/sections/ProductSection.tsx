import type React from "react";
import appSmartTrash from "../assets/app-smart-trash.webp";
import appTerminal from "../assets/app-terminal.webp";
import { useT } from "../lib/i18n";
import { Bracket, SectionRule, frame, h2, monoBody } from "../lib/ui";

// Only the two extras get this section: the launching basics (apps, sites, workspaces, the
// Fiple Bar) are already shown above — in the film, the setup steps and the Mac app screenshot.
// `feature` is an index into t.product.features.
const EXTRAS: { feature: number; src: string; alt: string }[] = [
  { feature: 4, src: appSmartTrash, alt: "Smart Trash on iPhone: reviewing a stale photo, with trash, undo and keep buttons" },
  { feature: 5, src: appTerminal, alt: "Remote Terminal on iPhone: an interactive Mac shell session with a keyboard toolbar" },
];

/**
 * "More than a launcher": a bracketed index (topology "Public goods") of the features nobody
 * else has — mono number, large title, mono description, and the real iPhone screen beside it.
 */
export function ProductSection() {
  const t = useT();
  return (
    <section className={`${frame} scroll-mt-20`} id="product">
      <SectionRule index="03" label={t.product.eyebrow} />
      <h2 data-brighten className={`${h2} mt-10 max-w-[1000px]`}>
        {t.product.title}
      </h2>

      <Bracket className="mt-16 max-sm:mt-10">
        <ul>
          {EXTRAS.map(({ feature, src, alt }, i) => {
            const { title, body } = t.product.features[feature];
            return (
              <li
                key={feature}
                data-reveal
                style={{ "--d": `${i * 90}ms` } as React.CSSProperties}
                className="group grid grid-cols-12 items-center gap-x-6 gap-y-8 border-b border-ink/12 px-5 py-14 transition-colors duration-300 last:border-b-0 hover:bg-ink/[0.04] max-sm:px-1 max-sm:py-10"
              >
                <div className="col-span-6 col-start-2 max-[940px]:col-span-12 max-[940px]:col-start-1">
                  <span className="block font-mono text-[12px] text-muted">{String(i + 1).padStart(2, "0")}.</span>
                  <h3 className="mt-5 font-display text-[clamp(40px,4.6vw,72px)] leading-[1] text-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2">
                    {title}
                  </h3>
                  <p className={`mt-6 max-w-[52ch] ${monoBody}`}>{body}</p>
                </div>
                <div className="col-span-4 col-start-9 flex justify-center max-[940px]:col-span-12 max-[940px]:col-start-1">
                  <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    width={760}
                    height={1644}
                    className="h-auto w-[min(260px,70vw)] rounded-[13%/6%] ring-1 ring-ink/10 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [filter:drop-shadow(0_30px_60px_rgba(0,0,0,0.6))] group-hover:-translate-y-2"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Bracket>
    </section>
  );
}
