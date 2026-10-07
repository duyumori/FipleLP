import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import icon from "../assets/fiple-icon.png";
import { Footer } from "../components/Footer";
import { LangToggle } from "../components/LangToggle";
import { useT } from "../lib/i18n";
import { MAC_DOWNLOAD_FILE_URL } from "../lib/links";

export function DownloadPage() {
  const t = useT();
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => linkRef.current?.click(), 800);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <header className="sticky top-4 z-50 mx-auto mt-5 flex w-[min(1120px,calc(100%_-_40px))] items-center justify-between rounded-2xl border border-line bg-white/70 py-2.5 pr-3.5 pl-3.5 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_10px_30px_-12px_rgba(16,15,15,0.18)] backdrop-blur-xl max-sm:top-2.5 max-sm:mt-3 max-sm:w-[min(calc(100%_-_24px),1120px)]">
        <a className="flex items-center gap-2.5" href="/" aria-label="Fiple home">
          <img src={icon} alt="" className="size-9 drop-shadow-[0_4px_8px_rgba(16,15,15,0.30)]" width={36} height={36} />
          <span className="font-display text-[20px] font-bold tracking-[-0.03em] text-ink">Fiple</span>
        </a>
        <div className="flex items-center gap-2.5">
          <LangToggle />
          <a className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] font-semibold text-ink transition hover:border-ink/20 hover:shadow-card active:scale-[0.98] max-sm:px-3" href="/">
            <ArrowLeft size={16} /> {t.legalPage.back}
          </a>
        </div>
      </header>

      <main className="mx-auto w-[min(680px,calc(100%_-_40px))] pt-16 pb-24 max-sm:w-[min(calc(100%_-_24px),680px)] max-sm:pt-10">
        <p className="font-mono text-[12px] font-medium tracking-[0.14em] text-blue uppercase">{t.downloadPage.eyebrow}</p>
        <h1 className="mt-3 font-display text-[clamp(34px,6vw,52px)] leading-[1.05] font-bold tracking-[-0.035em] text-ink">
          {t.downloadPage.title}
        </h1>
        <p className="mt-4 text-[18px] leading-[1.6] text-muted">
          {t.downloadPage.subtitle} {t.downloadPage.ifNotStarted}{" "}
          <a ref={linkRef} className="font-medium text-blue hover:underline" href={MAC_DOWNLOAD_FILE_URL} download>
            {t.downloadPage.retry}
          </a>.
        </p>

        <h2 className="mt-12 font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">{t.downloadPage.stepsHeading}</h2>
        <ol className="mt-4 grid gap-4">
          {t.downloadPage.steps.map((step, i) => (
            <li key={i} className="flex gap-4 text-[16.5px] leading-[1.6] text-ink2">
              <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-white font-mono text-[13px] font-semibold text-ink shadow-card" aria-hidden="true">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <p className="mt-10 font-mono text-[12.5px] text-faint">{t.downloadPage.note}</p>
      </main>

      <Footer />
    </>
  );
}
