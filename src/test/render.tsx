import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { LangProvider, type Lang } from "../lib/i18n";

/** Render inside the app's providers, optionally forcing the language. */
export function renderWithLang(ui: ReactElement, lang: Lang = "en") {
  window.localStorage.setItem("fiple-lang", lang);
  return render(<LangProvider>{ui}</LangProvider>);
}
