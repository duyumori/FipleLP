import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { legalDocs } from "./data/legal";
import type { Lang } from "./lib/i18n";
import { messages } from "./lib/translations";
import { renderWithLang } from "./test/render";

vi.mock("@vercel/analytics/react", () => ({ Analytics: () => null }));

const langs: Lang[] = ["en", "ru", "kz"];
let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  // Any React warning (missing key, bad prop, act…) fails the render tests.
  consoleError = vi.spyOn(console, "error");
});

afterEach(() => {
  expect(consoleError).not.toHaveBeenCalled();
  vi.useRealTimers();
});

function renderAt(path: string, lang: Lang) {
  window.history.replaceState(null, "", path);
  return renderWithLang(<App />, lang);
}

describe.each(langs)("App (%s)", (lang) => {
  const t = messages[lang];

  it("renders the landing page", () => {
    renderAt("/", lang);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getAllByText(t.download.title).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(t.download.emailAria)).toBeInTheDocument();
  });

  it.each(["/how", "/mac", "/product"])("renders the landing page for %s", (path) => {
    renderAt(path, lang);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it.each(["privacy", "terms", "support"] as const)("renders the %s page", (key) => {
    renderAt(`/${key}`, lang);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(legalDocs[lang][key].title);
  });

  it("renders the download page", () => {
    renderAt("/download", lang);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(t.downloadPage.title);
  });
});
