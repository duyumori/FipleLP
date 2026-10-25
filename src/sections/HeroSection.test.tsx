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
  let queue = new Map<number, FrameRequestCallback>();
  let nextId = 0;
  let ioCallback: IOCallback | null = null;
  let ms = 0;

  beforeEach(() => {
    queue = new Map();
    nextId = 0;
    ioCallback = null;
    ms = 0;
    vi.spyOn(performance, "now").mockImplementation(() => ms);
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      queue.set(++nextId, cb);
      return nextId;
    });
    vi.stubGlobal("cancelAnimationFrame", (id: number) => queue.delete(id));
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

  const flush = (frames = 6, frameMs = 1000 / 60) => {
    for (let i = 0; i < frames; i++) {
      ms += frameMs;
      const batch = [...queue.values()];
      queue.clear();
      batch.forEach((cb) => cb(ms));
    }
  };

  it("parks the loop once converged and wakes again on scroll", () => {
    renderWithLang(<HeroSection />);

    // The track scrolls into view → the loop arms itself.
    ioCallback?.([{ isIntersecting: true }]);
    expect(queue.size).toBeGreaterThan(0);

    // jsdom has no layout, so progress is flat and the values converge immediately:
    // after a few frames the loop must stop rescheduling instead of spinning forever.
    flush();
    expect(queue.size).toBe(0);

    // Leaving the viewport must not leave a stray scheduled frame behind.
    ioCallback?.([{ isIntersecting: false }]);
    flush();
    expect(queue.size).toBe(0);

    // Coming back and scrolling must restart the animation.
    ioCallback?.([{ isIntersecting: true }]);
    window.dispatchEvent(new Event("scroll"));
    expect(queue.size).toBeGreaterThan(0);
    flush();
    expect(queue.size).toBe(0);
  });

  it("moves the same distance after 100 ms at 30, 60 and 120 FPS", () => {
    const opacityAfter = (fps: number) => {
      const view = renderWithLang(<HeroSection />);
      const track = view.container.querySelector<HTMLElement>("#top")!;
      const stage = track.querySelector<HTMLElement>("section")!;
      const intro = view.getByRole("heading", { level: 1 }).parentElement!.parentElement!;
      Object.defineProperty(track, "offsetHeight", { value: 4000 });
      Object.defineProperty(stage, "offsetHeight", { value: window.innerHeight });
      // Scroll halfway through the intro's exit, then let the animation catch up.
      vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
        top: -(4000 - window.innerHeight) * 0.05,
      } as DOMRect);
      ioCallback?.([{ isIntersecting: true }]);
      flush(fps / 10, 1000 / fps);
      const opacity = Number(intro.style.opacity);
      view.unmount();
      return opacity;
    };

    const at60 = opacityAfter(60);
    expect(at60).toBeGreaterThan(0.5);
    expect(at60).toBeLessThan(1);
    expect(opacityAfter(30)).toBeCloseTo(at60, 5);
    expect(opacityAfter(120)).toBeCloseTo(at60, 5);
  });
});
