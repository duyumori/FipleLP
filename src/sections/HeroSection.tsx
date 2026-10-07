import { useEffect, useRef } from "react";
import { Apple, ArrowDown } from "lucide-react";
import appHome from "../assets/app-home.webp";
import { HeroBackdrop } from "../components/HeroBackdrop";
import type { HeroMotion } from "../components/HeroBackdrop";
import { useT } from "../lib/i18n";
import { APP_STORE_URL } from "../lib/links";
import { meta } from "../lib/ui";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Scroll timeline (0..1 across the pinned track): the intro leaves, the phone gets its own
// beat in the centre, then each phrase gets a window. The last phrase stays until the pin ends.
const INTRO_OUT = 0.1;
const PHONE_START = 0.07;
const PHONE_SPAN = 0.27;
const SCENE_START = 0.34;
const SCENE_SPAN = 0.21;

// Rhythm: a full-screen frame with 24px gutters — just the oversized light headline anchored
// bottom-left with one short line + CTA under it; the live surface gets the rest of the screen.
export function HeroSection() {
  const t = useT();
  const trackRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const phraseRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const motion = useRef<HeroMotion>({ p: 0, mx: 0, my: 0 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    const target = { mx: 0, my: 0 };
    const onPointer = (e: PointerEvent) => {
      target.mx = (e.clientX / window.innerWidth) * 2 - 1;
      target.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (finePointer && !reduced) window.addEventListener("pointermove", onPointer, { passive: true });

    const scrollProgress = () => {
      const distance = track.offsetHeight - window.innerHeight;
      return distance > 0 ? clamp01(-track.getBoundingClientRect().top / distance) : 0;
    };

    const apply = () => {
      const { p, mx, my } = motion.current;

      // Intro (headline, pitch, CTA) lifts away and drifts slightly against the cursor.
      const intro = 1 - smooth(0, INTRO_OUT, p);
      const introEl = introRef.current;
      if (introEl) {
        introEl.style.opacity = String(intro);
        introEl.style.transform = `translate3d(0, ${(1 - intro) * -60}px, 0)`;
        introEl.style.visibility = intro < 0.02 ? "hidden" : "visible";
      }
      // Phone beat: rises from below into the centre, tilts toward the cursor, then lifts away.
      const phoneEl = phoneRef.current;
      if (phoneEl) {
        const local = (p - PHONE_START) / PHONE_SPAN;
        const pin = smooth(0, 0.35, local);
        const pout = smooth(0.7, 1, local);
        const o = pin * (1 - pout);
        phoneEl.style.opacity = String(o);
        phoneEl.style.visibility = o < 0.01 ? "hidden" : "visible";
        if (o >= 0.01) {
          const y = (1 - pin) * 45 - pout * 35; // in vh
          phoneEl.style.transform =
            `translate3d(${mx * 14}px, calc(${y}vh + ${my * 10}px), 0) ` +
            `perspective(1400px) rotateY(${mx * 9}deg) rotateX(${-my * 7}deg) scale(${0.9 + pin * 0.1})`;
        }
      }
      if (titleRef.current) titleRef.current.style.transform = `translate3d(${mx * -6}px, ${my * -4}px, 0)`;

      // Phrases swap in the centre: rise + unblur in, lift + blur out.
      const last = phraseRefs.current.length - 1;
      phraseRefs.current.forEach((el, i) => {
        if (!el) return;
        const local = (p - (SCENE_START + i * SCENE_SPAN)) / SCENE_SPAN;
        const fadeIn = smooth(0, 0.3, local);
        const fadeOut = i === last ? 0 : smooth(0.7, 1, local);
        const o = fadeIn * (1 - fadeOut);
        if (o < 0.01) {
          // Off-stage phrases: hide once and skip the per-frame transform/blur writes.
          if (el.style.visibility !== "hidden") {
            el.style.visibility = "hidden";
            el.style.opacity = "0";
          }
          return;
        }
        el.style.opacity = String(o);
        el.style.transform = `translate3d(${mx * -10}px, ${(1 - fadeIn) * 40 - fadeOut * 40}px, 0)`;
        el.style.filter = `blur(${(1 - o) * 10}px)`;
        el.style.visibility = "visible";
      });
    };

    // One loop: ease toward the real scroll/cursor position so everything glides.
    let raf = 0;
    const tick = () => {
      const m = motion.current;
      m.p += (scrollProgress() - m.p) * (reduced ? 1 : 0.12);
      m.mx += (target.mx - m.mx) * 0.06;
      m.my += (target.my - m.my) * 0.06;
      apply();
      raf = requestAnimationFrame(tick);
    };
    // Only spin while the track is on screen.
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      raf = entry.isIntersecting ? requestAnimationFrame(tick) : 0;
    });
    io.observe(track);
    motion.current.p = scrollProgress();
    apply();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    // Tall scroll track; the screen inside stays pinned while the scene plays.
    <div ref={trackRef} className="relative h-[440svh]" id="top">
      <section className="sticky top-0 isolate flex h-svh flex-col overflow-hidden">
        <HeroBackdrop motion={motion} className="absolute inset-0 -z-10 h-full w-full" />

        {/* Intro screen: copy bottom-left, the live surface everywhere else */}
        <div
          ref={introRef}
          className="flex min-h-0 flex-1 flex-col justify-end px-6 pt-[72px] pb-[clamp(40px,10svh,104px)] will-change-transform max-sm:px-4 max-sm:pt-16 max-sm:pb-12"
        >
          <div ref={titleRef}>
            <h1 className="animate-rise font-display text-[clamp(40px,7.4vw,124px)] leading-[0.9] font-light tracking-[-0.025em] text-ink min-[941px]:whitespace-nowrap">
              {t.hero.titleLine1}
              <br />
              {t.hero.titleLine2Pre}
              <span className="italic">{t.hero.titleAccent}</span>
            </h1>
            <p className="mt-8 max-w-[420px] animate-rise text-[19px] leading-[1.35] font-light text-ink2 [animation-delay:120ms] max-sm:mt-5 max-sm:text-[16px]">
              {t.hero.subtitle}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4 animate-rise [animation-delay:200ms] max-sm:mt-5">
              <a
                className="group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-medium text-white shadow-lift transition hover:bg-ink2 active:scale-[0.98]"
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Apple size={17} className="transition group-hover:-translate-y-0.5" />
                {t.hero.ctaPrimary}
              </a>
              <a className={`group inline-flex items-center gap-1.5 text-ink transition hover:text-muted ${meta}`} href="/how">
                {t.hero.ctaSecondary}
                <ArrowDown size={12} className="transition group-hover:translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Scroll scene, beat 1: the real app, centre stage */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center pt-[72px] max-sm:pt-16">
          <div ref={phoneRef} className="invisible relative opacity-0 will-change-transform">
            <div
              className="absolute top-1/2 left-1/2 h-[80%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-[40%] bg-[radial-gradient(circle,rgba(16,15,15,0.10),transparent_70%)] blur-2xl"
              aria-hidden="true"
            />
            <img
              src={appHome}
              alt="Fiple iPhone app, connected MacBook Air, the Code and Work workspaces, and the Fiple Bar"
              className="relative z-[1] h-[min(76svh,760px)] w-auto rounded-[15.4%/7.4%] [filter:drop-shadow(0_2px_6px_rgba(16,15,15,0.10))_drop-shadow(0_30px_45px_rgba(16,15,15,0.22))]"
              width={286}
              loading="eager"
            />
          </div>
        </div>

        {/* Scroll scene, beat 2: phrases stacked in one cell, swapped by scroll progress */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 max-sm:px-4">
          {t.hero.scene.map((line, i) => (
            <p
              key={i}
              ref={(el) => {
                phraseRefs.current[i] = el;
              }}
              className="invisible col-start-1 row-start-1 text-center font-display text-[clamp(44px,8vw,128px)] leading-[0.95] font-light tracking-[-0.03em] text-ink opacity-0 will-change-transform"
            >
              {line}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
