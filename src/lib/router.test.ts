import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { navigate, useRoute } from "./router";

/** Clicks a link and reports whether the router took it over (jsdom can't follow real navigations). */
function clickLink(attrs: Record<string, string>, init: MouseEventInit = {}) {
  let handledByRouter = false;
  const stopNavigation = (e: Event) => {
    handledByRouter = e.defaultPrevented;
    e.preventDefault();
  };
  window.addEventListener("click", stopNavigation, { once: true });
  const a = document.createElement("a");
  for (const [k, v] of Object.entries(attrs)) a.setAttribute(k, v);
  a.textContent = "link";
  document.body.append(a);
  const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
  a.dispatchEvent(event);
  a.remove();
  return handledByRouter;
}

describe("useRoute", () => {
  it.each([
    ["/", "home"],
    ["/how", "how"],
    ["/mac", "mac"],
    ["/product", "product"],
    ["/privacy", "privacy"],
    ["/terms", "terms"],
    ["/support", "support"],
    ["/download", "download"],
    ["/does-not-exist", "home"],
  ])("maps %s to %s", (path, route) => {
    window.history.replaceState(null, "", path);
    const { result } = renderHook(() => useRoute());
    expect(result.current).toBe(route);
  });

  it("updates on navigate() and on back/forward", () => {
    const { result } = renderHook(() => useRoute());
    act(() => navigate("/privacy"));
    expect(window.location.pathname).toBe("/privacy");
    expect(result.current).toBe("privacy");

    act(() => {
      window.history.replaceState(null, "", "/terms");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(result.current).toBe("terms");
  });

  it("does not push history when navigating to the current path", () => {
    const push = vi.spyOn(window.history, "pushState");
    navigate("/");
    expect(push).not.toHaveBeenCalled();
  });

  it("intercepts plain clicks on internal links", () => {
    const { result } = renderHook(() => useRoute());
    let handled = false;
    act(() => {
      handled = clickLink({ href: "/support" });
    });
    expect(handled).toBe(true);
    expect(result.current).toBe("support");
  });

  it.each([
    ["external", { href: "https://apps.apple.com/" }, {}],
    ["mailto", { href: "mailto:support@fiple.app" }, {}],
    ["download", { href: "/downloads/app.dmg", download: "" }, {}],
    ["new tab", { href: "/privacy", target: "_blank" }, {}],
    ["cmd-click", { href: "/privacy" }, { metaKey: true }],
    ["middle click", { href: "/privacy" }, { button: 1 }],
  ])("leaves %s links to the browser", (_name, attrs, init) => {
    renderHook(() => useRoute());
    expect(clickLink(attrs, init)).toBe(false);
    expect(window.location.pathname).toBe("/");
  });
});
