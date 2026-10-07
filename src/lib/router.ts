import { useEffect, useState } from "react";

export type Route = "home" | "how" | "mac" | "product" | "privacy" | "terms" | "support" | "download";

const pathMap: Record<string, Route> = {
  "/how": "how",
  "/mac": "mac",
  "/product": "product",
  "/privacy": "privacy",
  "/terms": "terms",
  "/support": "support",
  "/download": "download",
};

const ROUTE_EVENT = "fiple:routechange";

function parse(): Route {
  return pathMap[window.location.pathname] ?? "home";
}

export function navigate(to: string) {
  const target = new URL(to, window.location.origin);
  const next = target.pathname;
  const current = window.location.pathname;

  if (next === current) {
    return;
  }

  window.history.pushState({}, "", next);
  window.dispatchEvent(new Event(ROUTE_EVENT));
}

function isModifiedClick(e: MouseEvent) {
  return e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parse);

  useEffect(() => {
    const sync = () => setRoute(parse());
    window.addEventListener("popstate", sync);
    window.addEventListener(ROUTE_EVENT, sync);

    // Intercept internal links so navigation stays client-side.
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || isModifiedClick(e)) return;
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;
      // Leave external links and other protocols (mailto:, https:, tel:) alone.
      if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return;

      if (href.startsWith("/")) {
        e.preventDefault();
        navigate(href);
      }
    }

    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener(ROUTE_EVENT, sync);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return route;
}
