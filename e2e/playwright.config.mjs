// Tests navigateur de la page de réservation, sur la preview STAGING.
// BASE_URL : URL du déploiement à tester (par défaut, l'alias de la branche staging).
import { defineConfig, devices } from "@playwright/test";

const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: ".",
  testMatch: /.*\.spec\.mjs/,
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "https://bookme-client-git-staging-jeserasolondraibes-projects.vercel.app",
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    // Si la protection des previews Vercel est active.
    extraHTTPHeaders: bypass ? { "x-vercel-protection-bypass": bypass, "x-vercel-set-bypass-cookie": "true" } : {},
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 14"] } },
    // WEB-02 : Chrome Android.
    { name: "android", use: { ...devices["Pixel 7"] } },
  ],
});
