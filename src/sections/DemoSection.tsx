import { useEffect, useRef, useState } from "react";
import { Play, X } from "lucide-react";
import { useT } from "../lib/i18n";
import { Bracket, RevealWords, frame, meta, monoBody } from "../lib/ui";

const FULL_LENGTH = "0:31";

/**
 * The real thing on film. Inline: a muted 8.5s loop of the live footage (hands, iPhone,
 * MacBook — pair once, tap, the Mac launches) that plays only while on screen. A play button
 * opens the full demo in a player with controls. HEVC for Safari/macOS, H.264 fallback.
 */
export function DemoSection() {
  const t = useT();
  const loopRef = useRef<HTMLVideoElement>(null);
  const fullRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);

  // Inline loop: play while visible. React doesn't render the `muted` attribute, and Safari's
  // autoplay policy checks it — so set both the property and the attribute ourselves.
  useEffect(() => {
    const v = loopRef.current;
    if (!v) return;
    v.muted = true;
    v.setAttribute("muted", "");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Phones: decoding the loop while only a sliver is on screen just burns the hardware
    // decoder on every scroll past this section — start at half visibility. Desktop keeps
    // the original 0.25 start point (the product is laptop-first; nothing else changes there).
    const threshold = window.matchMedia("(hover: none) and (pointer: coarse)").matches ? 0.5 : 0.25;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !open) v.play().catch(() => {});
        else v.pause();
      },
      { threshold },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [open]);

  // Full player: start on open, Esc closes, page doesn't scroll underneath.
  useEffect(() => {
    if (!open) return;
    fullRef.current?.play().catch(() => {});
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <section className={`${frame} pt-8 pb-32 max-sm:pb-20`} aria-label={t.demo.eyebrow}>
      <div className="grid grid-cols-12 items-end gap-x-6 gap-y-6">
        <h2 data-brighten className="col-span-8 font-display text-[clamp(44px,6vw,96px)] leading-[0.92] text-ink max-[940px]:col-span-12">
          {t.demo.titleLine1}
          <br />
          <span className="text-ink/40">{t.demo.titleLine2}</span>
        </h2>
        <p className={`col-span-4 col-start-9 max-w-[40ch] pb-2 ${monoBody} max-[940px]:col-span-12 max-[940px]:col-start-1`}>
          <RevealWords text={t.demo.caption} />
        </p>
      </div>

      <Bracket className="mt-14 max-sm:mt-8">
        <div className="relative px-[clamp(8px,2vw,32px)] py-[clamp(8px,2vw,32px)]">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative block w-full cursor-pointer text-left"
            aria-label={`${t.demo.watch} (${FULL_LENGTH})`}
          >
            <div data-zoom className="origin-top overflow-hidden rounded-[14px] bg-base2 will-change-transform max-sm:rounded-[8px]">
              <video
                ref={loopRef}
                className="block aspect-[1280/714] w-full object-cover transition-[filter] duration-500 group-hover:brightness-75"
                poster="/media/fiple-demo-poster.jpg"
                muted
                loop
                playsInline
                autoPlay
                preload="metadata"
                aria-hidden="true"
              >
                <source src="/media/fiple-demo-hevc.mp4" type='video/mp4; codecs="hvc1"' />
                <source src="/media/fiple-demo.mp4" type="video/mp4" />
              </video>
            </div>
            {/* Play affordance — big and obvious, like a real video player */}
            <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="flex items-center gap-3 rounded-full bg-white py-3 pr-6 pl-3 text-[#111] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 max-sm:py-2 max-sm:pr-4 max-sm:pl-2">
                <span className="grid size-12 place-items-center rounded-full bg-[#111] text-white max-sm:size-9">
                  <Play size={18} className="translate-x-[1px] fill-white" />
                </span>
                <span className="text-[15px] font-medium max-sm:text-[13px]">{t.demo.watch}</span>
                <span className={`text-[#111]/50 ${meta}`}>{FULL_LENGTH}</span>
              </span>
            </span>
          </button>
          <span className={`pointer-events-none absolute right-[clamp(20px,3vw,52px)] bottom-[clamp(20px,3vw,52px)] inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-white backdrop-blur ${meta}`}>
            <span className="size-1.5 animate-pulse rounded-full bg-[#ff453a]" aria-hidden="true" />
            {t.demo.eyebrow}
          </span>
        </div>
      </Bracket>

      {open && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-[clamp(12px,4vw,64px)] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={t.demo.watch}
          onClick={() => setOpen(false)}
        >
          <video
            ref={fullRef}
            className="max-h-full w-full max-w-[1400px] rounded-[12px] bg-black"
            controls
            playsInline
            preload="auto"
            poster="/media/fiple-demo-poster.jpg"
            onClick={(e) => e.stopPropagation()}
          >
            <source src="/media/fiple-demo-full-hevc.mp4" type='video/mp4; codecs="hvc1"' />
            <source src="/media/fiple-demo-full.mp4" type="video/mp4" />
          </video>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label={t.demo.close}
          >
            <X size={20} />
          </button>
        </div>
      )}
    </section>
  );
}
