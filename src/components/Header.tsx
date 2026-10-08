import { useEffect, useState } from "react";
import icon from "../assets/fiple-icon.png";
import { useT } from "../lib/i18n";
import { APP_STORE_URL } from "../lib/links";
import { LangToggle } from "./LangToggle";

const navLink = "transition hover:opacity-60";

export function Header() {
  const t = useT();
  const [onDark, setOnDark] = useState(false);
  useEffect(() => {
    const check = () => {
      const zones = document.querySelectorAll<HTMLElement>("[data-header-dark]");
      setOnDark(
        [...zones].some((z) => {
          const r = z.getBoundingClientRect();
          return r.top <= 36 && r.bottom > 36 && Number(getComputedStyle(z).opacity) > 0.5;
        }),
      );
    };
    let raf = 0;
    let settle = 0;
    // One rAF-throttled check per scroll burst — the old version ran the forced-layout
    // check synchronously on every scroll event *and* on a double rAF *and* on a timer.
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => ((raf = 0), check()));
      // Re-check after the eased values (footer veil, etc.) have converged too.
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        check();
        settle = window.setTimeout(check, 450);
      }, 250);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex h-[72px] w-full items-center justify-between px-6 transition-colors duration-300 max-sm:h-16 max-sm:px-4 ${
        onDark ? "text-white" : "text-ink"
      }`}
    >
      {/* Over dark pages: a soft fade from the page colour, so headings slide under the nav
          instead of colliding with it (no solid bar — it stays visually transparent) */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-[120%] bg-gradient-to-b from-[#111111] via-[#111111]/80 to-transparent transition-opacity duration-300 ${
          onDark ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />
      <a className="flex items-center gap-2" href="/" aria-label="Fiple home">
        <img src={icon} alt="" className="size-7 drop-shadow-[0_3px_6px_rgba(16,15,15,0.25)]" width={28} height={28} />
        <span className="font-display text-[22px] font-normal tracking-[-0.02em]">Fiple</span>
      </a>
      <div className="flex items-center gap-7 max-sm:gap-2.5">
        <nav
          className={`hidden items-center gap-7 text-[11px] font-normal tracking-[0.1em] uppercase md:flex ${
            onDark ? "text-white/75" : "text-ink2"
          }`}
          aria-label="Primary navigation"
        >
          <a className={navLink} href="/how">{t.header.navHow}</a>
          <a className={navLink} href="/mac">{t.header.navMac}</a>
          <a className={navLink} href="/product">{t.header.navProduct}</a>
        </nav>
        <LangToggle />
        <a
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-medium tracking-[0.1em] whitespace-nowrap uppercase transition active:scale-[0.98] ${
            onDark ? "bg-white text-ink hover:bg-white/90" : "bg-ink text-white hover:bg-ink2"
          }`}
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="size-1.5 rounded-full bg-green" aria-hidden="true" />
          {t.header.download}
        </a>
      </div>
    </header>
  );
}
