import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeroSection } from "./HeroSection";
import { renderWithLang } from "../test/render";

type IOCallback = (entries: { isIntersecting: boolean }[]) => void;

/**
 * The hero's animation loop must park itself once everything has converged: a phone sitting
 * on an idle screen should schedule zero animation frames. Before the fix the loop
 * rescheduled rAF forever while the track was on screen, which is what made mobile lag.
 */
describe("HeroSection animation loop", () => {
  let queue: FrameRequestCallback[] = [];
  let ioCallback: IOCallback | null = null;
  let ms = 0;

  beforeEach(() => {
    queue = [];
    ioCallback = null;
    ms = 0;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      queue.push(cb);
      return queue.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: IOCallback) {
          ioCallback = cb;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const flush = (frames = 6) => {
    for (let i = 0; i < frames; i++) {
      ms += 16;
      const batch = queue;
      queue = [];
      batch.forEach((cb) => cb(ms));
    }
  };

  it("parks the loop once converged and wakes again on scroll", () => {
    renderWithLang(<HeroSection />);

    // The track scrolls into view → the loop arms itself.
    ioCallback?.([{ isIntersecting: true }]);
    expect(queue.length).toBeGreaterThan(0);

    // jsdom has no layout, so progress is flat and the values converge immediately:
    // after a few frames the loop must stop rescheduling instead of spinning forever.
    flush();
    expect(queue.length).toBe(0);

    // Leaving the viewport must not leave a stray scheduled frame behind.
    ioCallback?.([{ isIntersecting: false }]);
    flush();
    expect(queue.length).toBe(0);

    // Coming back and scrolling must restart the animation.
    ioCallback?.([{ isIntersecting: true }]);
    window.dispatchEvent(new Event("scroll"));
    expect(queue.length).toBeGreaterThan(0);
    flush();
    expect(queue.length).toBe(0);
  });
});
