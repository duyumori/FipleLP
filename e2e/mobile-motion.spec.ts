import { expect, test, type Page } from "@playwright/test";

test("mobile footer artwork covers its links without an empty scroll track", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Desktop retains its pinned scenes");
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  const layout = await page.evaluate(() => ({
    footerHeight: document.querySelector("footer")!.getBoundingClientRect().height,
    artworkHeight: document.querySelector(".footer-art")!.getBoundingClientRect().height,
    linkHeights: [...document.querySelectorAll("footer nav a, .footer-socials a")].map(a => a.getBoundingClientRect().height),
    viewportHeight: window.innerHeight,
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.footerHeight).toBeLessThan(layout.viewportHeight * 1.2);
  expect(layout.artworkHeight).toBeGreaterThanOrEqual(layout.footerHeight);
  expect(layout.linkHeights.every(height => height >= 44)).toBe(true);
  expect(layout.scrollWidth).toBe(layout.width);
  await expect(page.locator('footer img[data-static-backdrop="footer"]')).toHaveCount(1);
});

async function scrollHero(page: Page, progress: number) {
  await expect(page.locator("#top > section")).toBeAttached();
  const target = await page.evaluate((p) => {
    document.documentElement.style.scrollBehavior = "auto";
    const track = document.querySelector<HTMLElement>("#top")!;
    const stage = track.querySelector<HTMLElement>("section")!;
    const top = scrollY + track.getBoundingClientRect().top + (track.offsetHeight - stage.offsetHeight) * p;
    window.scrollTo({ top, behavior: "instant" });
    return top;
  }, progress);
  // WebKit may apply a programmatic scroll asynchronously. Observe it; do not
  // issue repeated scrolls, which would hide a real reset by the application.
  await expect.poll(() => page.evaluate(top => Math.abs(scrollY - top), target)).toBeLessThanOrEqual(1);
}

// Reduced-motion desktop fades the still surface; touch keeps its paper fully opaque.
async function surfaceOpacity(page: Page) {
  return page.locator("[data-hero-surface]").evaluate((surface) => {
    let opacity = 1;
    for (let el: Element | null = surface; el && el.id !== "top"; el = el.parentElement) {
      opacity *= Number(getComputedStyle(el).opacity);
    }
    return opacity;
  });
}

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`hero handoff reveals readable content and restores on reverse scroll (${reducedMotion})`, async ({ page, isMobile }) => {
    test.skip(!isMobile && reducedMotion !== "reduce", "Desktop uses the animated shader exit");
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();

    await scrollHero(page, 0.93);
    if (isMobile) {
      await expect.poll(() => surfaceOpacity(page)).toBe(1);
      await expect(page.locator("[data-hero-phrase]").last()).toBeHidden();
      // Check actual hit-testing through the clip: the new section must be exposed,
      // not merely present in the DOM behind an opaque or grey hero layer.
      await expect.poll(() => page.evaluate(() => {
        const stage = document.querySelector<HTMLElement>("#top > section")!;
        const pointerEvents = stage.style.pointerEvents;
        stage.style.pointerEvents = "auto";
        const exposed = !!document.elementFromPoint(innerWidth / 2, innerHeight * 0.6)?.closest(".manifesto");
        stage.style.pointerEvents = pointerEvents;
        return exposed;
      })).toBe(true);
    } else {
      await expect.poll(() => surfaceOpacity(page)).toBeGreaterThan(0.4);
      await expect.poll(() => surfaceOpacity(page)).toBeLessThan(0.6);
    }
    await expect(page.locator("#top > section")).toBeVisible();

    await scrollHero(page, 1);
    await expect(page.locator("#top > section")).toBeHidden();
    if (isMobile) {
      const copy = await page.locator(".manifesto > div").evaluate(el => ({
        headingTop: el.querySelector("h2")!.getBoundingClientRect().top,
        copyBottom: el.querySelector("p:last-child")!.getBoundingClientRect().bottom,
        height: innerHeight,
      }));
      expect(copy.headingTop).toBeGreaterThan(64);
      expect(copy.copyBottom).toBeLessThan(copy.height);
    }
    await scrollHero(page, 0);
    await expect.poll(() => surfaceOpacity(page)).toBeGreaterThan(0.99);
    await expect(page.locator("#top > section")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
  });
}

test("touch phone animation has no blur or drop-shadow filters", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Desktop retains its decorative filters");
  await page.goto("/");
  await scrollHero(page, 0.2);
  const phone = page.getByRole("img", { name: /^Fiple iPhone app, connected/ });
  await expect(phone).toBeVisible();
  const filters = await phone.evaluate((img) =>
    [...img.parentElement!.querySelectorAll("*")].map((el) => getComputedStyle(el).filter),
  );
  expect(filters.every((filter) => filter === "none")).toBe(true);
  await expect(page.locator("canvas")).toHaveCount(0);
  const artwork = page.locator('[data-static-backdrop="hero"]');
  await expect(artwork).toBeVisible();
  await expect(artwork).toHaveJSProperty("complete", true);
  const resolution = await artwork.evaluate(async (node) => {
    const image = node as HTMLImageElement;
    const bitmap = await createImageBitmap(await (await fetch(image.currentSrc)).blob());
    const result = { pixels: bitmap.width, required: Math.ceil(innerWidth * devicePixelRatio) };
    bitmap.close();
    return result;
  });
  expect(resolution.pixels).toBeGreaterThanOrEqual(resolution.required);
  await expect(page.locator("video")).toHaveCount(0);
});

test("header follows the visible hero and stays readable on the textured footer", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The textured compact footer is touch-only");
  await page.goto("/");
  await scrollHero(page, 0.87);
  // Let the scroll handlers, color transition and the header's delayed check finish.
  await page.waitForTimeout(800);
  await expect(page.locator("header")).toHaveCSS("color", "rgb(17, 17, 17)");
  await scrollHero(page, 1);
  await expect(page.locator("header")).toHaveCSS("color", "rgb(255, 255, 255)");
  await page.evaluate(() => window.scrollTo(0, document.querySelector("footer")!.offsetTop));
  await page.waitForTimeout(800);
  await expect(page.locator("footer nav")).toBeVisible();
  await expect(page.locator("header")).toHaveCSS("color", "rgb(255, 255, 255)");
  await scrollHero(page, 0);
  await expect(page.locator("header")).toHaveCSS("color", "rgb(17, 17, 17)");
});

test("the handoff fits a small phone and survives rotation with translated copy", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Touch layout only");
  await page.addInitScript(() => localStorage.setItem("fiple-lang", "ru"));
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await page.evaluate(() => document.fonts.ready);
  for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    // The protocol resize can finish before WebKit updates its viewport units.
    await expect.poll(() => page.evaluate(() => ({
      width: innerWidth,
      height: innerHeight,
      stageHeight: document.querySelector<HTMLElement>("#top > section")!.offsetHeight,
    }))).toEqual({ ...viewport, stageHeight: viewport.height });
    await scrollHero(page, 1);
    await expect(page.locator("#top > section")).toBeHidden();
    const layout = await page.locator(".manifesto > div").evaluate(el => ({
      headingTop: el.querySelector("h2")!.getBoundingClientRect().top,
      copyBottom: el.querySelector("p:last-child")!.getBoundingClientRect().bottom,
      width: document.documentElement.scrollWidth,
    }));
    expect(layout.headingTop).toBeGreaterThan(64);
    expect(layout.copyBottom).toBeLessThan(viewport.height);
    expect(layout.width).toBe(viewport.width);
  }
});
