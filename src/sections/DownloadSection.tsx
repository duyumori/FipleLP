import { useState } from "react";
import type { FormEvent } from "react";
import { Apple, Check, Download } from "lucide-react";
import { getSupabase } from "../lib/supabase";
import { useT } from "../lib/i18n";
import { APP_STORE_URL, MAC_DOWNLOAD_URL } from "../lib/links";
import { SectionRule, frame, meta } from "../lib/ui";

type SubmitState = "idle" | "submitting" | "success" | "error";
type StatusKey = "default" | "emptyEmail" | "adding" | "already" | "success" | "error";

export function DownloadSection() {
  const t = useT();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [statusKey, setStatusKey] = useState<StatusKey>("default");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") ?? "").trim();

    if (!email) {
      setSubmitState("error");
      setStatusKey("emptyEmail");
      return;
    }

    setSubmitState("submitting");
    setStatusKey("adding");

    try {
      const { error } = await getSupabase().from("waitlist").insert({ email });

      if (error) {
        if (error.code === "23505") {
          setSubmitState("success");
          setStatusKey("already");
          form.reset();
          return;
        }

        throw error;
      }

      setSubmitState("success");
      setStatusKey("success");
      form.reset();
    } catch (error) {
      console.error("Waitlist signup failed", error);
      setSubmitState("error");
      setStatusKey("error");
    }
  }

  const success = submitState === "success";
  const message = t.download.status[statusKey];

  return (
    <section className={`${frame} scroll-mt-20 bg-ink pt-6 pb-14 text-white max-sm:pb-12`} id="download" data-header-dark>
      <SectionRule index="04" label={t.download.badge} dark bare />
      <div className="mt-12 grid grid-cols-12 items-end gap-x-6 gap-y-10 max-sm:mt-10">
        <h2 className="col-span-8 font-display text-[clamp(48px,6.2vw,100px)] leading-[0.92] font-light tracking-[-0.03em] text-balance text-white max-[940px]:col-span-12">
          {t.download.title}
        </h2>
        <div className="col-span-4 col-start-9 pb-[0.4em] max-[940px]:col-span-12 max-[940px]:col-start-1">
          <p className="max-w-[440px] text-[19px] leading-[1.4] font-light text-white/65 max-sm:text-[17px]">{t.download.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-white px-5 text-[15px] font-medium text-ink transition hover:bg-white/90 active:scale-[0.98]"
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Apple size={17} />
              {t.download.appStore}
            </a>
            <a
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/25 px-5 text-[15px] font-medium text-white transition hover:border-white/50 active:scale-[0.98]"
              href={MAC_DOWNLOAD_URL}
            >
              <Download size={16} />
              {t.download.macDirect}
            </a>
          </div>
        </div>
      </div>

      {/* Email updates — secondary, so it sits under a hairline as a quiet single row */}
      <div className="mt-16 grid grid-cols-12 items-center gap-x-6 gap-y-4 border-t border-white/20 pt-6 max-sm:mt-12">
        <p
          className={`col-span-6 flex items-center gap-1.5 text-[15px] font-light max-[940px]:col-span-12 ${
            submitState === "error" ? "text-white" : success ? "text-white" : "text-white/55"
          }`}
          role="status"
        >
          {success && <Check size={15} />}
          {message}
        </p>
        <form
          className="col-span-5 col-start-8 flex items-center gap-2 border-b border-white/25 transition focus-within:border-white max-[940px]:col-span-12 max-[940px]:col-start-1"
          onSubmit={handleSubmit}
        >
          <input
            name="email"
            className="h-12 w-full min-w-0 bg-transparent text-[16px] font-light text-white placeholder:text-white/35 focus:outline-none"
            aria-label={t.download.emailAria}
            type="email"
            placeholder="you@example.com"
            required
          />
          <button
            className={`shrink-0 py-3 whitespace-nowrap text-white transition hover:text-white/60 disabled:cursor-not-allowed disabled:opacity-60 ${meta}`}
            disabled={submitState === "submitting"}
            type="submit"
          >
            {submitState === "submitting" ? t.download.submitting : t.download.submitIdle} →
          </button>
        </form>
      </div>
    </section>
  );
}
