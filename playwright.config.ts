import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

// Set E2E_BASE_URL to test an already deployed site (Vercel preview or prod) instead of a local build.
const remoteURL = process.env.E2E_BASE_URL?.replace(/\/$/, "");
// Lets CI reach Vercel previews that sit behind Deployment Protection.
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: remoteURL ?? `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    extraHTTPHeaders: bypassSecret
      ? { "x-vercel-protection-bypass": bypassSecret, "x-vercel-set-bypass-cookie": "true" }
      : undefined,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  // Test the real production bundle, not the dev server.
  webServer: remoteURL
    ? undefined
    : {
        command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
        url: `http://127.0.0.1:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
