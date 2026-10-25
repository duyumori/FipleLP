import heroSmall from "../assets/surface-hero-768.webp";
import heroLarge from "../assets/surface-hero-1440.webp";
import footerSmall from "../assets/surface-footer-768.webp";
import footerLarge from "../assets/surface-footer-1440.webp";

/** The same procedural artwork, rendered offline at Retina resolution for touch. */
export function MobileBackdrop({ variant }: { variant: "hero" | "footer" }) {
  const hero = variant === "hero";
  const small = hero ? heroSmall : footerSmall;
  const large = hero ? heroLarge : footerLarge;
  return (
    <img
      data-static-backdrop={variant}
      src={large}
      srcSet={`${small} 768w, ${large} 1440w`}
      sizes="100vw"
      width={1440}
      height={hero ? 2560 : 1800}
      className="h-full w-full object-cover"
      alt=""
      aria-hidden="true"
      loading={hero ? "eager" : "lazy"}
      fetchPriority={hero ? "high" : "low"}
      decoding="async"
    />
  );
}
