import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import icon from "../assets/fiple-icon.png";
import { Footer } from "../components/Footer";
import { LangToggle } from "../components/LangToggle";
import { SUPPORT_EMAIL, type LegalDoc } from "../data/legal";
import { useT } from "../lib/i18n";

const EMAIL_RE = SUPPORT_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const LINK_RE = new RegExp(`(${EMAIL_RE}|https?:\\/\\/[^\\s]+)`, "g");

// Linkify the support email and any http(s) URL inside a block of text.
function withLinks(text: string): ReactNode {
  const parts = text.split(LINK_RE);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part === SUPPORT_EMAIL) {
      return (
        <a key={i} className="font-medium text-blue hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {part}
        </a>
      );
    }
    if (/^https?:\/\//.test(part)) {
      // Keep trailing punctuation (e.g. a sentence period) out of the link target.
      const [, url = part, trail = ""] = part.match(/^(.*?)([.,;:!?)]*)$/) ?? [];
      return (
        <span key={i}>
          <a className="font-medium text-blue hover:underline" href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
          {trail}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  const t = useT();
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

      <main className="mx-auto w-[min(760px,calc(100%_-_40px))] pt-16 pb-24 max-sm:w-[min(calc(100%_-_24px),760px)] max-sm:pt-10">
        <p className="font-mono text-[12px] font-medium tracking-[0.14em] text-blue uppercase">{doc.eyebrow}</p>
        <h1 className="mt-3 font-display text-[clamp(36px,6vw,56px)] leading-[1.02] font-bold tracking-[-0.035em] text-ink">
          {doc.title}
        </h1>
        <p className="mt-4 text-[18px] leading-[1.6] text-muted">{doc.tagline}</p>
        {doc.updated && (
          <p className="mt-3 font-mono text-[12px] text-faint">{t.legalPage.updated} {doc.updated}</p>
        )}

        <div className="mt-12 grid gap-10">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-[22px] font-semibold tracking-[-0.02em] text-ink">{section.heading}</h2>
              <div className="mt-3 grid gap-3">
                {section.blocks.map((block, i) =>
                  block.type === "p" ? (
                    <p key={i} className="text-[16.5px] leading-[1.65] text-ink2">{withLinks(block.text)}</p>
                  ) : (
                    <ul key={i} className="grid gap-2.5 pl-1">
                      {block.items.map((item, j) => (
                        <li key={j} className="flex gap-3 text-[16.5px] leading-[1.6] text-ink2">
                          <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-blue" aria-hidden="true" />
                          <span>{withLinks(item)}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
