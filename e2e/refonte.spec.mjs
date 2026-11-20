// Refonte de la page web (WEB-20 à WEB-22), sur la preview STAGING.
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const SUPABASE_URL = process.env.STAGING_SUPABASE_URL ?? "https://xhalwjciuecctxiykiks.supabase.co";
const ANON_KEY = process.env.STAGING_SERVICE_KEY ?? process.env.STAGING_ANON_KEY;
if (SUPABASE_URL.includes("flrtdhzcimbkbcgczmea")) throw new Error("Refus : jamais sur la prod.");

// Couleur d'accent de chaque ambiance, lue dans lib/themes.ts (une seule source).
const themesSrc = readFileSync(new URL("../lib/themes.ts", import.meta.url), "utf8");
const accentOf = (name) => themesSrc.match(new RegExp(`\\b${name}:\\s*\\{[^}]*accent:\\s*"(#[0-9A-Fa-f]{6})"`))?.[1];

test("WEB-20 la page reprend l'ambiance choisie dans l'app", async ({ page }) => {
  test.skip(!ANON_KEY, "clé staging manquante");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/prestas?slug=eq.staging-demo&select=theme`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
  });
  const [{ theme }] = await res.json();
  const expected = accentOf(theme ?? "epure");
  expect(expected, `ambiance ${theme} introuvable dans lib/themes.ts`).toBeTruthy();

  await page.goto("/staging-demo");
  const accent = await page.locator("main").first().evaluate((el) => getComputedStyle(el).getPropertyValue("--t-accent").trim());
  expect(accent.toLowerCase()).toBe(expected.toLowerCase());
});

test("WEB-21 barre « Choisir un créneau » fixe en bas sur mobile", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile uniquement");
  await page.goto("/staging-demo");
  await page.getByRole("button", { name: /Pose vernis/ }).click();
  const bar = page.locator("button:visible", { hasText: "Choisir un créneau" }).first();
  await expect(bar).toBeVisible();
  const fixedParent = bar.locator("xpath=ancestor::div[contains(@class,'fixed')][1]");
  await expect(fixedParent).toHaveCount(1);
  // Toujours visible et collée au bas de l'écran après défilement.
  await page.mouse.wheel(0, 2000);
  await expect(bar).toBeInViewport();
  const box = await fixedParent.boundingBox();
  const vh = page.viewportSize().height;
  expect(Math.abs(box.y + box.height - vh)).toBeLessThan(4);
});

test("WEB-22 la page d'accueil présente Book Me Again", async ({ page }) => {
  await page.goto("/");
  await expect(page).not.toHaveTitle(/Create Next App/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/Next\.js/)).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Confidentialité/ })).toBeVisible();
});
