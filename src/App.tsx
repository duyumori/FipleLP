import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { DemoStrip } from "./components/DemoStrip";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { legalDocs } from "./data/legal";
import { useLang } from "./lib/i18n";
import { useRoute } from "./lib/router";
import { DownloadPage } from "./pages/DownloadPage";
import { LegalPage } from "./pages/LegalPage";
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
        <DemoStrip />
        <HowItWorksSection />
        <MacShowcase />
        <ProductSection />
        <UseCasesSection />
        <DownloadSection />
      </main>
      <Footer reveal />
      <Analytics />
    </>
  );
}
