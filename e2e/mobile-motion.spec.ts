import { expect, test, type Page } from "@playwright/test";

async function scrollHero(page: Page, progress: number) {
  await page.evaluate((p) => {
    document.documentElement.style.scrollBehavior = "auto";
    const track = document.querySelector<HTMLElement>("#top")!;
    const stage = track.querySelector<HTMLElement>("section")!;
    window.scrollTo(0, (track.offsetHeight - stage.offsetHeight) * p);
  }, progress);
}

// Measure the opacity of the surface including its wrappers, independently of where
// the fade is implemented. The original frozen canvas stayed fully opaque until hidden.
async function surfaceOpacity(page: Page) {
  return page.locator("#top canvas").evaluate((canvas) => {
    let opacity = 1;
    for (let el: Element | null = canvas; el && el.id !== "top"; el = el.parentElement) {
      opacity *= Number(getComputedStyle(el).opacity);
    }
    return opacity;
  });
}

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`static hero fades into content and restores on reverse scroll (${reducedMotion})`, async ({ page, isMobile }) => {
    test.skip(!isMobile && reducedMotion !== "reduce", "Desktop uses the animated shader exit");
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();

    await scrollHero(page, 0.93);
    await expect.poll(() => surfaceOpacity(page)).toBeGreaterThan(0.4);
    await expect.poll(() => surfaceOpacity(page)).toBeLessThan(0.6);
    await expect(page.locator("#top > section")).toBeVisible();

    await scrollHero(page, 1);
    await expect(page.locator("#top > section")).toBeHidden();
    await scrollHero(page, 0);
    await expect.poll(() => surfaceOpacity(page)).toBeGreaterThan(0.99);
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
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator("video")).toHaveCount(0);
});

test("header follows the visible hero and stays readable on the flat footer", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The flat footer is touch-only");
  await page.goto("/");
  await scrollHero(page, 0.87);
  // Let the scroll handlers, color transition and the header's delayed check finish.
  await page.waitForTimeout(800);
  await expect(page.locator("header")).toHaveCSS("color", "rgb(17, 17, 17)");
  await page.evaluate(() => window.scrollTo(0, document.querySelector("footer")!.offsetTop));
  await page.waitForTimeout(800);
  await expect(page.locator("footer nav")).toBeVisible();
  await expect(page.locator("header")).toHaveCSS("color", "rgb(255, 255, 255)");
  await scrollHero(page, 0);
  await expect(page.locator("header")).toHaveCSS("color", "rgb(17, 17, 17)");
});
