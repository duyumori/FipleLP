import appPairing from "../assets/app-pairing.webp";
import { useT } from "../lib/i18n";
import { SectionRule, frame, h2, lead } from "../lib/ui";

export function HowItWorksSection() {
  const t = useT();
  return (
    <section className={`${frame} scroll-mt-20 pt-28 pb-32 max-sm:pt-20 max-sm:pb-20`} id="how">
      <SectionRule index="01" label={t.how.eyebrow} />
      <div className="mt-10 grid grid-cols-12 gap-x-6 gap-y-6">
        <h2 className={`${h2} col-span-8 max-[940px]:col-span-12`}>
          {t.how.titleLine1}
          <br className="max-sm:hidden" /> {t.how.titleLine2}
        </h2>
        <p className={`${lead} col-span-4 col-start-9 max-w-[440px] self-end max-[940px]:col-span-12 max-[940px]:col-start-1`}>
          {t.how.subtitle}
        </p>
      </div>

      <div className="mt-20 grid grid-cols-12 items-center gap-x-6 gap-y-14 max-sm:mt-14">
        {/* Pairing screenshot */}
        <div className="relative col-span-5 grid place-items-center max-[940px]:order-2 max-[940px]:col-span-12">
          <div className="absolute h-[70%] w-[70%] rounded-[40%] bg-[radial-gradient(circle,rgba(16,15,15,0.09),transparent_70%)] blur-2xl" aria-hidden="true" />
          <img
            src={appPairing}
            alt="Fiple iPhone pairing screen, scanning the local network for your Mac, with a 4-digit code field"
            className="relative z-[1] w-[280px] max-sm:w-[250px] [filter:drop-shadow(0_2px_6px_rgba(16,15,15,0.10))_drop-shadow(0_30px_45px_rgba(16,15,15,0.22))]"
            width={280}
            loading="lazy"
          />
        </div>

        {/* Steps — a real ordered sequence, so numbered */}
        <ol className="col-span-6 col-start-7 border-b border-ink/15 max-[940px]:order-1 max-[940px]:col-span-12 max-[940px]:col-start-1">
          {t.how.steps.map((step, i) => (
            <li key={i} className="grid grid-cols-[72px_1fr] gap-6 border-t border-ink/15 py-8 max-sm:grid-cols-[48px_1fr] max-sm:gap-4 max-sm:py-6">
              <span className="font-display text-[52px] leading-[0.9] font-light tracking-[-0.03em] text-muted tabular-nums max-sm:text-[36px]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-[28px] leading-[1.05] font-light tracking-[-0.015em] text-ink max-sm:text-[23px]">{step.title}</h3>
                <p className="mt-2.5 max-w-[460px] text-[16px] leading-[1.5] text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
