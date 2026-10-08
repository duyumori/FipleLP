import icon from "../assets/fiple-icon.png";
import { useT } from "../lib/i18n";
import { meta, monoBody } from "../lib/ui";

/**
 * The manifesto — the first thing seen through the hero's exit hole (topology's centred
 * "Where our name comes from" screen). The track is 150svh and starts 150svh above the
 * hero's end, so the content pins dead-centre while the hole opens, then scrolls on with the page.
 * The title is two-tone: first sentence full ink, the rest muted (Linear/Raycast style).
 */
export function UseCasesSection() {
  const t = useT();
  const [first, ...rest] = t.useCases.title.split(/(?<=\.)\s+/);
  return (
    <section className="relative h-[150svh]" aria-label={t.useCases.eyebrow}>
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center px-6 text-center max-sm:px-4">
        <img src={icon} alt="" className="size-11 opacity-90" width={44} height={44} />
        <p className={`mt-8 text-muted ${meta}`}>{t.useCases.eyebrow}</p>
        {/* One sentence per line on wide screens; natural wrapping on phones */}
        <h2 className="mt-5 font-display text-[clamp(44px,6.6vw,108px)] leading-[0.95] text-balance text-ink">
          {first}
          {rest.length > 0 && (
            <>
              <br className="max-sm:hidden" /> <span className="text-ink/40">{rest.join(" ")}</span>
            </>
          )}
        </h2>
        <p className={`mt-8 max-w-[46ch] ${monoBody}`}>{t.useCases.subtitle}</p>
      </div>
    </section>
  );
}
