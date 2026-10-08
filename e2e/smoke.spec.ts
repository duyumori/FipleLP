import { expect, test, type Page } from "@playwright/test";

// Vercel Analytics only exists on Vercel; locally its script 404s — that's not an app error.
const IGNORED = [/_vercel\/insights/];

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error" && !IGNORED.some((re) => re.test(msg.text() + msg.location().url))) {
      errors.push(`console: ${msg.text()}`);
    }
  });
  page.on("requestfailed", (req) => {
    const failure = req.failure()?.errorText ?? "";
    // Media/download requests get aborted on navigation; that's expected.
    if (!IGNORED.some((re) => re.test(req.url())) && !/ABORTED|cancelled/i.test(failure)) {
      errors.push(`requestfailed: ${req.url()} ${failure}`);
    }
  });
  page.on("response", (res) => {
    if (res.status() >= 400 && !IGNORED.some((re) => re.test(res.url()))) {
      errors.push(`HTTP ${res.status()}: ${res.url()}`);
    }
  });
  return errors;
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!window.localStorage.getItem("fiple-lang")) window.localStorage.setItem("fiple-lang", "en");
  });
});

const pages = [
  // Hero copy changes often; any non-empty h1 proves the landing rendered.
  { path: "/", heading: /\S/ },
  { path: "/privacy", heading: /privacy/i },
  { path: "/terms", heading: /terms/i },
  { path: "/support", heading: /support|help/i },
];

for (const { path, heading } of pages) {
  test(`${path} loads without errors`, async ({ page }) => {
    const errors = trackErrors(page);
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
}

test("landing scrolls through every section without errors", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
  });
  await expect(page.locator("#download")).toBeAttached();
  await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
  expect(errors).toEqual([]);
});

test("/download page is served and the .dmg exists", async ({ page, request }) => {
  const errors = trackErrors(page);
  await page.goto("/download");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const href = await page.locator('a[download]').first().getAttribute("href");
  expect(href).toMatch(/\/downloads\/.+\.dmg/);
  const file = await request.head(href!);
  expect(file.status()).toBe(200);
  expect(Number(file.headers()["content-length"])).toBeGreaterThan(1_000_000);
  expect(errors).toEqual([]);
});

test("footer links navigate client-side to legal pages and back", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Privacy Policy" }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/privacy/i);
  await page.getByRole("link", { name: /Back to home/i }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/\S/);
});

test("language switch translates the page and is remembered", async ({ page, isMobile }) => {
  await page.goto("/privacy");
  if (isMobile) {
    await page.getByRole("button", { name: /language|язык|тіл/i }).click();
    await page.getByRole("listbox").getByRole("button", { name: "RU" }).click();
  } else {
    await page.getByRole("button", { name: "RU", exact: true }).click();
  }
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
});
