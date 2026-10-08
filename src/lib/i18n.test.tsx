import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LangProvider, useLang } from "./i18n";
import { messages } from "./translations";

const wrapper = ({ children }: { children: ReactNode }) => <LangProvider>{children}</LangProvider>;

function mockNavigatorLanguage(value: string) {
  vi.spyOn(window.navigator, "language", "get").mockReturnValue(value);
}

afterEach(() => vi.restoreAllMocks());

describe("LangProvider", () => {
  it("prefers the saved language", () => {
    window.localStorage.setItem("fiple-lang", "kz");
    mockNavigatorLanguage("ru-RU");
    const { result } = renderHook(() => useLang(), { wrapper });
    expect(result.current.lang).toBe("kz");
  });

  it("ignores an invalid saved value", () => {
    window.localStorage.setItem("fiple-lang", "de");
    mockNavigatorLanguage("en-US");
    const { result } = renderHook(() => useLang(), { wrapper });
    expect(result.current.lang).toBe("en");
  });

  it.each([
    ["ru-RU", "ru"],
    ["kk-KZ", "kz"],
    ["en-GB", "en"],
    ["fr-FR", "en"],
  ])("detects %s from the browser as %s", (nav, lang) => {
    mockNavigatorLanguage(nav);
    const { result } = renderHook(() => useLang(), { wrapper });
    expect(result.current.lang).toBe(lang);
  });

  it("switches language, persists it and updates <html lang>", () => {
    mockNavigatorLanguage("en-US");
    const { result } = renderHook(() => useLang(), { wrapper });
    act(() => result.current.setLang("ru"));
    expect(result.current.lang).toBe("ru");
    expect(result.current.t).toBe(messages.ru);
    expect(window.localStorage.getItem("fiple-lang")).toBe("ru");
    expect(document.documentElement.lang).toBe("ru");
  });

  it("keeps working when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceeded");
    });
    const { result } = renderHook(() => useLang(), { wrapper });
    act(() => result.current.setLang("kz"));
    expect(result.current.lang).toBe("kz");
  });

  it("throws a clear error outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useLang())).toThrow(/LangProvider/);
  });
});
