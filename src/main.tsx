import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LangProvider } from "./lib/i18n";
import "./styles/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found");
}
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
const SECTION_PATHS = ["/how", "/mac", "/product"];
if (SECTION_PATHS.includes(window.location.pathname) || (window.location.pathname === "/" && window.location.hash)) {
  history.replaceState(null, "", "/");
}
window.scrollTo(0, 0);

createRoot(rootElement).render(
  <React.StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </React.StrictMode>,
);
