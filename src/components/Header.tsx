import { useEffect, useState } from "react";
import icon from "../assets/fiple-icon.png";
import { useT } from "../lib/i18n";
import { APP_STORE_URL } from "../lib/links";
import { LangToggle } from "./LangToggle";

const navLink = "transition hover:opacity-60";

export function Header() {
  const t = useT();
  // Always flat and transparent — no fill on scroll. Over dark zones the text flips to light.
  const [onDark, setOnDark] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      // Light text over any dark zone under the header: the download band, and the footer's
      // black veil while it is still mostly opaque.
      const zones = document.querySelectorAll<HTMLElement>("[data-header-dark]");
      setOnDark(
        [...zones].some((z) => {
          const r = z.getBoundingClientRect();
          return r.top <= 36 && r.bottom > 36 && Number(getComputedStyle(z).opacity) > 0.5;
        }),
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 flex h-[72px] w-full items-center justify-between px-6 transition-colors duration-300 max-sm:h-16 max-sm:px-4 ${
        onDark ? "text-white" : "text-ink"
      }`}
    >
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
