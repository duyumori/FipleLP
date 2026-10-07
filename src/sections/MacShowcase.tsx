import appMac from "../assets/app-mac.webp";
import { useT } from "../lib/i18n";
import { SectionRule, frame, h2, lead } from "../lib/ui";

export function MacShowcase() {
  const t = useT();
  return (
    <section className={`${frame} scroll-mt-20 pb-32 max-sm:pb-20`} id="mac">
      <SectionRule index="02" label={t.mac.eyebrow} />
      <div className="mt-10 grid grid-cols-12 gap-x-6 gap-y-6">
        <h2 className={`${h2} col-span-8 max-[940px]:col-span-12`}>
          {t.mac.titleLine1}
          <br className="max-sm:hidden" /> {t.mac.titleLine2}
        </h2>
        <p className={`${lead} col-span-4 col-start-9 max-w-[440px] self-end max-[940px]:col-span-12 max-[940px]:col-start-1`}>
          {t.mac.subtitle}
        </p>
      </div>

      {/* Mac window */}
      <div className="relative mt-16 max-sm:mt-10">
        <div className="absolute inset-x-10 top-10 -z-[1] h-full rounded-[28px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,15,15,0.08),transparent_60%)] blur-2xl" aria-hidden="true" />
        <div className="overflow-hidden rounded-[14px] border border-line shadow-device max-sm:rounded-[10px]">
          <img
            src={appMac}
            alt="Fiple for macOS, showing the Code, Work, and Music workspaces, the Fiple Bar, the Terminal and Smart Trash tools, and Recent activity"
            className="block w-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
