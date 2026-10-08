import appMac from "../assets/app-mac.webp";
import { useT } from "../lib/i18n";
import { Bracket, RevealWords, SectionRule, frame, lead } from "../lib/ui";

/**
 * The Mac app, topology "Select investments" scale: an oversized two-tone heading that lights up
 * as it arrives, the pitch on the right, then the real app inside the bracketed frame, easing up
 * from 92% to full size as it comes into view.
 */
export function MacShowcase() {
  const t = useT();
  return (
    <section className={`${frame} scroll-mt-20 pb-32 max-sm:pb-20`} id="mac">
      <SectionRule index="02" label={t.mac.eyebrow} />
      <h2 data-brighten className="mt-10 font-display text-[clamp(52px,9vw,148px)] leading-[0.9] text-ink">
        {t.mac.titleLine1}
        <br />
        <span className="text-ink/40">{t.mac.titleLine2}</span>
      </h2>
      <div className="mt-10 grid grid-cols-12 gap-x-6">
        <p className={`${lead} col-span-4 col-start-9 max-w-[440px] max-[940px]:col-span-12 max-[940px]:col-start-1`}>
          <RevealWords text={t.mac.subtitle} />
        </p>
      </div>

      <Bracket className="mt-16 max-sm:mt-10">
        <div className="px-[clamp(12px,3vw,48px)] py-[clamp(12px,3vw,48px)]">
          {/* Capped at the screenshot's native size (1992px = 996 CSS px at 2×) so it never upscales and blurs */}
          <div data-zoom className="mx-auto max-w-[996px] origin-top overflow-hidden rounded-[12px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.8)] will-change-transform max-sm:rounded-[8px]">
            <img
              src={appMac}
              alt="Fiple for macOS, showing the Code, Work, and Music workspaces, the Fiple Bar, the Terminal and Smart Trash tools, and Recent activity"
              className="block w-full"
              loading="lazy"
            />
          </div>
        </div>
      </Bracket>
    </section>
  );
}
