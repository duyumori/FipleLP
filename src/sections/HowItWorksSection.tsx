import { useEffect, useRef, useState } from "react";
import appHome from "../assets/app-home.webp";
import appMacDevices from "../assets/app-mac-devices.webp";
import appPairing from "../assets/app-pairing.webp";
import { useT } from "../lib/i18n";
import { RevealWords, SectionRule, frame, h2, lead, monoBody } from "../lib/ui";

// One visual per step, told as a chain: the Mac shows a code → you enter it on the iPhone →
// the iPhone home with your Mac connected. (The Workspaces screenshot lives in the Mac section.)
const VISUALS = [
  { src: appMacDevices, alt: "Fiple for macOS, Devices: waiting for your iPhone, showing the pairing code 0089", phone: false },
  { src: appPairing, alt: "Fiple on iPhone, scanning the local network for your Mac, with the 4-digit code", phone: true },
  { src: appHome, alt: "Fiple on iPhone: the connected Mac, workspaces and the Fiple Bar", phone: true },
];

const phoneShadow =
  "[filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.35))_drop-shadow(0_30px_60px_rgba(0,0,0,0.55))]";

/**
 * Setup, told as a pinned scene (topology's "Principles" layout): the visual stays put on the
 * left while the three steps scroll by on the right, and it swaps to match the step in focus.
 */
export function HowItWorksSection() {
  const t = useT();
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    // The step crossing the middle band of the screen is the active one.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section className={`${frame} relative scroll-mt-20 pt-16 pb-32 max-sm:pb-20`} id="how">
      <SectionRule index="01" label={t.how.eyebrow} />
      <div className="mt-10 grid grid-cols-12 gap-x-6 gap-y-6">
        <h2 data-brighten className={`${h2} col-span-8 max-[940px]:col-span-12`}>
          {t.how.titleLine1}
          <br className="max-sm:hidden" /> <span className="text-ink/40">{t.how.titleLine2}</span>
        </h2>
        <p className={`${lead} col-span-4 col-start-9 max-w-[440px] self-end max-[940px]:col-span-12 max-[940px]:col-start-1`}>
          <RevealWords text={t.how.subtitle} />
        </p>
      </div>

      <div className="mt-24 grid grid-cols-12 gap-x-6 max-sm:mt-14">
        {/* Pinned visual — swaps with the active step (desktop) */}
        <div className="col-span-6 max-[940px]:hidden">
          <div className="sticky top-[15svh] h-[70svh]">
            {VISUALS.map((v, i) => (
              <img
                key={i}
                src={v.src}
                alt={v.alt}
                loading="lazy"
                className={`absolute inset-0 m-auto max-h-full max-w-full object-contain transition-[opacity,scale,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  v.phone
                    ? `h-[92%] w-auto rounded-[13%/6.2%] ${phoneShadow}`
                    : "h-auto w-full rounded-[10px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]"
                } ${active === i ? "scale-100 opacity-100 blur-0" : "scale-[0.96] opacity-0 blur-[6px]"}`}
              />
            ))}
          </div>
        </div>

        {/* Steps */}
        <ol className="col-span-5 col-start-8 max-[940px]:col-span-12 max-[940px]:col-start-1">
          {t.how.steps.map((step, i) => (
            <li
              key={i}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              data-step={i}
              className={`flex min-h-[70svh] flex-col justify-center border-t border-ink/15 py-16 transition-opacity duration-500 max-[940px]:min-h-0 max-[940px]:py-12 ${
                active === i ? "opacity-100" : "opacity-35 max-[940px]:opacity-100"
              }`}
            >
              <span className="font-mono text-[12px] text-muted">{String(i + 1).padStart(2, "0")}.</span>
              <h3 className="mt-4 font-display text-[clamp(36px,3.6vw,52px)] leading-[0.98] text-ink">{step.title}</h3>
              <p className={`mt-5 max-w-[44ch] ${monoBody}`}>{step.body}</p>
              {/* Mobile: the visual sits inline with its step */}
              <img
                src={VISUALS[i].src}
                alt={VISUALS[i].alt}
                loading="lazy"
                className={`mx-auto mt-10 hidden max-[940px]:block ${
                  VISUALS[i].phone ? `w-[240px] rounded-[13%/6.2%] ${phoneShadow}` : "w-full rounded-[8px]"
                }`}
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
