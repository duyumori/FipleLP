import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { ArrowUp, Send } from "lucide-react";
import icon from "../assets/fiple-icon.png";
import { HeroBackdrop } from "./HeroBackdrop";
import type { BackdropPose, HeroMotion } from "./HeroBackdrop";
import { useT } from "../lib/i18n";
import { LINKEDIN_URL, TELEGRAM_URL } from "../lib/links";
import { meta } from "../lib/ui";

// lucide dropped brand icons, so the LinkedIn glyph ships inline.
function LinkedinGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

// The footer gets its own full-screen slab of the live surface — a different crater than the
// hero — darkening toward the bottom, with the links framed by bracketed hairlines.
const FOOTER_POSE: BackdropPose = { center: [-0.1, 0.45], angle: -0.6, squash: 1.5, seed: 17.3, fadeBottom: false };
const SUPPORT_EMAIL = "support@fiple.app";

// Home footer, as on topology.vc: the black veil dissolves into the surface as the footer
// comes up → the surface alone, morphing as you scroll → the links frame rises from the
// bottom → the surface keeps morphing under it. Veil and frame are timed on the footer's entry.
// The veil runs on the footer's entry instead (see `veilProgress`): it starts dissolving as the
// footer comes up into the lower part of the screen, and is gone by the time it reaches the top.
const VEIL_FROM = 1.0;  // footer top just entering at the bottom → veil starts to fade
const VEIL_TO = 0.55;   // footer top at 55% → fully gone
// The frame also runs on entry: it rises while the surface is still surfacing, in place before the pin.
const FRAME_FROM = 0.6;  // footer top at 60% of the viewport height
const FRAME_TO = 0.15;   // footer top at 15% — in place just before it pins

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const link = "transition hover:opacity-60";

/** `reveal`: the home page's pinned scroll scene. Elsewhere it is a plain one-screen footer. */
export function Footer({ reveal = false }: { reveal?: boolean }) {
  const t = useT();
  const motion = useRef<HeroMotion>({ p: 0, mx: 0, my: 0 });
  const trackRef = useRef<HTMLElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!reveal || !track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;

    const target = { mx: 0, my: 0 };
    const onPointer = (e: PointerEvent) => {
      target.mx = (e.clientX / window.innerWidth) * 2 - 1;
      target.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (fine && !reduced) window.addEventListener("pointermove", onPointer, { passive: true });

    const progress = () => {
      const distance = track.offsetHeight - window.innerHeight;
      return distance > 0 ? clamp01(-track.getBoundingClientRect().top / distance) : 1;
    };

    const entry = (from: number, to: number) => {
      const top = track.getBoundingClientRect().top / window.innerHeight;
      return clamp01((from - top) / (from - to));
    };
    let veilP = entry(VEIL_FROM, VEIL_TO);
    let frameP = entry(FRAME_FROM, FRAME_TO);

    const apply = () => {
      const veil = 1 - smooth(0, 1, veilP);
      if (veilRef.current) {
        veilRef.current.style.opacity = String(veil);
        veilRef.current.style.visibility = veil < 0.01 ? "hidden" : "visible";
      }
      const frameIn = smooth(0, 1, frameP);
      if (frameRef.current) {
        frameRef.current.style.opacity = String(frameIn);
        frameRef.current.style.transform = `translate3d(0, ${(1 - frameIn) * 100}%, 0)`;
        frameRef.current.style.pointerEvents = frameIn > 0.5 ? "auto" : "none";
      }
    };

    // Ease toward the real scroll/cursor so the veil, frame and surface glide.
    let raf = 0;
    const tick = () => {
      const m = motion.current;
      m.p += (progress() - m.p) * (reduced ? 1 : 0.12);
      veilP += (entry(VEIL_FROM, VEIL_TO) - veilP) * (reduced ? 1 : 0.2);
      frameP += (entry(FRAME_FROM, FRAME_TO) - frameP) * (reduced ? 1 : 0.2);
      m.mx += (target.mx - m.mx) * 0.06;
      m.my += (target.my - m.my) * 0.06;
      apply();
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      raf = entry.isIntersecting ? requestAnimationFrame(tick) : 0;
    });
    io.observe(track);
    motion.current.p = progress();
    apply();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, [reveal]);

  const toTop = (e: MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer ref={trackRef} className={`relative isolate text-white ${reveal ? "h-[190svh]" : "h-svh"}`}>
      {/* One pinned screen: the surface, the bottom shade, the black veil and the links frame */}
      <div className="sticky top-0 h-svh overflow-hidden">
        <HeroBackdrop motion={motion} pose={FOOTER_POSE} className="absolute inset-0 h-full w-full" />
        <div
          className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(16,15,15,0.5)_72%,rgba(16,15,15,0.86))]"
          aria-hidden="true"
        />
        {reveal && <div ref={veilRef} className="absolute inset-0 bg-ink" data-header-dark aria-hidden="true" />}

        {/* Links frame, anchored to the bottom; on home it rises in from below */}
        <div
          ref={frameRef}
          className={`absolute inset-x-0 bottom-0 px-6 pb-6 max-sm:px-4 ${reveal ? "pointer-events-none opacity-0 will-change-transform" : ""}`}
        >
          {/* Top bracket */}
          <div className="h-[6px] rounded-t-[4px] border-x border-t border-white/40" aria-hidden="true" />

          <div className="grid grid-cols-12 gap-x-6 gap-y-10 px-5 pt-5 max-sm:px-1">
            <a
              href="#top"
              onClick={toTop}
              className="col-span-4 flex items-center gap-2.5 self-start max-[940px]:col-span-12"
              aria-label="Fiple — back to top"
            >
              <img src={icon} alt="" className="size-9" width={36} height={36} />
              <span className="font-display text-[40px] leading-none font-light tracking-[-0.02em]">Fiple</span>
            </a>

            {/* Two columns: the product pages, then support and legal */}
            <nav
              className={`col-span-5 col-start-6 grid grid-cols-2 gap-x-6 gap-y-2 text-white/85 ${meta} text-[12px] max-[940px]:col-span-8 max-[940px]:col-start-1 max-sm:grid-cols-1 max-sm:gap-y-8`}
              aria-label="Footer"
            >
              <div className="grid content-start gap-2">
                <a className={link} href="/how">{t.header.navHow}</a>
                <a className={link} href="/mac">{t.header.navMac}</a>
                <a className={link} href="/product">{t.header.navProduct}</a>
              </div>
              <div className="grid content-start gap-2">
                <a className={link} href="/support">{t.footer.legalSupport}</a>
                <a className={link} href="/privacy">{t.footer.legalPrivacy}</a>
                <a className={link} href="/terms">{t.footer.legalTerms}</a>
              </div>
            </nav>

            <div className="col-span-2 col-start-11 flex justify-end gap-4 self-start text-white/75 max-[940px]:col-span-4 max-[940px]:col-start-9">
              <a className={link} href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Telegram — @maksatovdias">
                <Send size={19} />
              </a>
              <a className={link} href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn — Dias Maksatov">
                <LinkedinGlyph size={18} />
              </a>
            </div>
          </div>

          <div className="mt-16 flex items-baseline justify-between gap-6 px-5 pb-5 max-sm:mt-12 max-sm:flex-col max-sm:items-start max-sm:px-1">
            <p className="text-[15px] font-light text-white/60">
              {t.footer.getInTouch}{" "}
              <a className={`text-white ${link}`} href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
            </p>
            <a href="#top" onClick={toTop} className={`inline-flex items-center gap-1.5 ${meta} ${link}`}>
              {t.footer.backToTop}
              <ArrowUp size={12} />
            </a>
          </div>

          {/* Bottom bracket */}
          <div className="h-[6px] rounded-b-[4px] border-x border-b border-white/40" aria-hidden="true" />
        </div>
      </div>
    </footer>
  );
}
