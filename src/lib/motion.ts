/** Preserve the 60 Hz easing curve at any frame rate. Elapsed time excludes parked loops. */
export function dampingFactor(amountAt60Hz: number, elapsedMs: number) {
  return 1 - Math.pow(1 - amountAt60Hz, Math.max(0, elapsedMs) / (1000 / 60));
}

/** Fired only when the mobile hero crosses the header's contrast threshold. */
export const HERO_CONTRAST_EVENT = "fiple:hero-contrast";
