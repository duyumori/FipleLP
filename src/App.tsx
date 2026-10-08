import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { legalDocs } from "./data/legal";
import { useLang } from "./lib/i18n";
import { useScrollFx } from "./lib/scrollFx";
import { useRoute } from "./lib/router";
import { DownloadPage } from "./pages/DownloadPage";
import { LegalPage } from "./pages/LegalPage";
import { DemoSection } from "./sections/DemoSection";
import { DownloadSection } from "./sections/DownloadSection";
import { HeroSection } from "./sections/HeroSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { MacShowcase } from "./sections/MacShowcase";
import { ProductSection } from "./sections/ProductSection";
import { UseCasesSection } from "./sections/UseCasesSection";

const sectionIds = {
  how: "how",
  mac: "mac",
  product: "product",
} as const;

export default function App() {
  const route = useRoute();
  const { lang } = useLang();
  // Reveal / brighten / zoom effects on the inner pages; re-scan when the page or language changes.
  useScrollFx(`${route}:${lang}`);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const sectionId = sectionIds[route as keyof typeof sectionIds];
      if (sectionId) {
        document.getElementById(sectionId)?.scrollIntoView();
      } else if (route !== "home") {
        window.scrollTo(0, 0);
        return;
      } else {
        window.scrollTo(0, 0);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [route]);

  if (route === "download") {
    return (
      <>
        <DownloadPage />
        <Analytics />
      </>
    );
  }

  if (route === "privacy" || route === "terms" || route === "support") {
    return (
      <>
        <LegalPage doc={legalDocs[lang][route]} />
        <Analytics />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        {/* Dark inner pages. Tucked 150svh under the hero's pinned track: the hero ends by opening
            a hole in the crater, and these pages are what shows through it (as on topology.vc).
            The manifesto comes first — it pins dead-centre while the hole opens. */}
        <div className="theme-dark relative -mt-[150svh]" data-header-dark>
          <UseCasesSection />
          <DemoSection />
          <HowItWorksSection />
          <MacShowcase />
          <ProductSection />
        </div>
        <DownloadSection />
      </main>
      <Footer reveal />
      <Analytics />
    </>
  );
}
