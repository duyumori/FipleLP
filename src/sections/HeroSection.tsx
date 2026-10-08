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
// beat in the centre, then each phrase gets a window. Then, as on topology.vc, a hole opens in
// the crater's centre and widens until it fills the screen — through it you see the dark inner
// pages, which are tucked underneath this track (see the .theme-dark wrapper in App.tsx).
const INTRO_OUT = 0.1;
const PHONE_START = 0.07;
const PHONE_SPAN = 0.27;
const SCENE_START = 0.34;
const SCENE_SPAN = 0.19;
const DARK: [number, number] = [0.86, 1.0]; // the hole widens over the last stretch of the pin

// Rhythm: a full-screen frame with 24px gutters — just the oversized light headline anchored
// bottom-left with one short line + CTA under it; the live surface gets the rest of the screen.
export function HeroSection() {
  const t = useT();
  const trackRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const phraseRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const darkRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const motion = useRef<HeroMotion>({ p: 0, mx: 0, my: 0 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    const target = { mx: 0, my: 0 };

    const scrollProgress = () => {
      const distance = track.offsetHeight - window.innerHeight;
      return distance > 0 ? clamp01(-track.getBoundingClientRect().top / distance) : 0;
    };

    let rawP = scrollProgress();
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

      // Exit: the see-through hole (drawn by the shader) grows from 0 to full screen. Driven by the
      // raw (unsmoothed) progress too, so a fast scroll can never unpin the hero half-open.
      const dark = smooth(DARK[0], DARK[1], Math.max(p, rawP));
      motion.current.dark = dark;
      // Once the hole has swallowed the screen, take the pinned stage out of the way entirely.
      const stage = stageRef.current;
      if (stage) {
        stage.style.visibility = dark > 0.995 ? "hidden" : "visible";
        stage.style.pointerEvents = dark > 0.5 ? "none" : "";
      }
      // Invisible marker the header reads to flip to light text once the dark page dominates.
      // Raw progress only: the smoothed value lags, and the header samples this on scroll events,
      // so a lagging value could leave the header stuck in its light-text mode back at the top.
      if (darkRef.current) darkRef.current.style.opacity = String(smooth(DARK[0], DARK[1], rawP));

      // Phrases swap in the centre: rise + unblur in, lift + blur out. The last one sinks into the hole.
      const last = phraseRefs.current.length - 1;
      phraseRefs.current.forEach((el, i) => {
        if (!el) return;
        const local = (p - (SCENE_START + i * SCENE_SPAN)) / SCENE_SPAN;
        const fadeIn = smooth(0, 0.3, local);
        const fadeOut = i === last ? smooth(DARK[0], DARK[0] + 0.05, p) : smooth(0.7, 1, local);
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
        if (finePointer) {
          // filter is the most expensive per-frame write (it re-rasterises the text); only
          // touch it when the value actually changed.
          const blur = `blur(${(1 - o) * 10}px)`;
          if (el.style.filter !== blur) el.style.filter = blur;
        } else if (el.style.filter) {
          // Touch: no per-frame blur at all — re-rasterising huge display text every frame
          // is the main scroll-jank source on phones. The phrases still fade + rise.
          el.style.filter = "";
        }
        el.style.visibility = "visible";
      });
    };

    // One loop: ease toward the real scroll/cursor position so everything glides.
    // It parks itself as soon as everything has converged — on an idle phone screen
    // (no scroll, no cursor) it burns zero frames instead of spinning at 60fps;
    // scroll/resize/pointer/visibility wake it again.
    let raf = 0;
    let visible = false;
    const tick = () => {
      raf = 0;
      const m = motion.current;
      rawP = scrollProgress();
      m.p += (rawP - m.p) * (reduced ? 1 : 0.12);
      m.mx += (target.mx - m.mx) * 0.06;
      m.my += (target.my - m.my) * 0.06;
      apply();
      const settled =
        Math.abs(rawP - m.p) < 0.0004 &&
        Math.abs(target.mx - m.mx) < 0.002 &&
        Math.abs(target.my - m.my) < 0.002;
      if (!settled) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (visible && !raf && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => wake();
    const onPointer = (e: PointerEvent) => {
      target.mx = (e.clientX / window.innerWidth) * 2 - 1;
      target.my = (e.clientY / window.innerHeight) * 2 - 1;
      wake();
    };
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else wake();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("visibilitychange", onVis);
    if (finePointer && !reduced) window.addEventListener("pointermove", onPointer, { passive: true });

    // Only spin while the track is on screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(track);
    motion.current.p = scrollProgress();
    apply();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    // Tall scroll track; the screen inside stays pinned while the scene plays.
    <div ref={trackRef} className="relative z-10 h-[480svh]" id="top">
      <section ref={stageRef} className="sticky top-0 isolate flex h-svh flex-col overflow-hidden">
        <HeroBackdrop motion={motion} className="absolute inset-0 -z-10 h-full w-full" />
        <div ref={darkRef} className="pointer-events-none absolute inset-0 opacity-0" data-header-dark aria-hidden="true" />

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
