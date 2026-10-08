import { useEffect } from "react";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);

/**
 * Page-wide scroll effects for the inner pages (topology.vc rhythm):
 * - [data-reveal]   → gets `.is-in` once it enters the viewport (CSS does the rise/unblur).
 * - [data-brighten] → opacity follows its position: dim at the bottom of the screen, full
 *                     once it reaches the upper half — headings "light up" as they arrive.
 * - [data-zoom]     → scale 0.92 → 1 as it comes up the screen.
 * `key` re-scans the DOM (e.g. on a language switch).
 */
export function useScrollFx(key: unknown) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const reveals = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    reveals.forEach((el) => (reduced ? el.classList.add("is-in") : io.observe(el)));

    const brights = [...document.querySelectorAll<HTMLElement>("[data-brighten]")];
    const zooms = [...document.querySelectorAll<HTMLElement>("[data-zoom]")];
    let raf = 0;
    const update = () => {
      raf = 0;
      const ih = window.innerHeight;
      for (const el of brights) {
        const top = el.getBoundingClientRect().top;
        const x = clamp01((ih * 0.95 - top) / (ih * 0.5));
        el.style.opacity = String(reduced ? 1 : 0.16 + 0.84 * smooth(x));
      }
      for (const el of zooms) {
        const top = el.getBoundingClientRect().top;
        const x = clamp01((ih - top) / (ih * 0.8));
        el.style.transform = reduced ? "" : `scale(${0.92 + 0.08 * smooth(x)})`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [key]);
}
