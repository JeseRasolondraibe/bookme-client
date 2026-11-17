// Parcours de réservation dans un vrai navigateur, sur la presta de test du
// staging (staging-demo). Les RDV créés sont supprimés à la fin.
import { test, expect } from "@playwright/test";

const SUPABASE_URL = process.env.STAGING_SUPABASE_URL ?? "https://xhalwjciuecctxiykiks.supabase.co";
const SERVICE_KEY = process.env.STAGING_SERVICE_KEY;
if (SUPABASE_URL.includes("flrtdhzcimbkbcgczmea")) throw new Error("Refus : jamais sur la prod.");

const RUN = Date.now();
const emails = [];

async function cleanup() {
  if (!SERVICE_KEY || !emails.length) return;
  const h = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };
  for (const email of emails) {
    const rows = await (await fetch(`${SUPABASE_URL}/rest/v1/bookings?client_email=eq.${encodeURIComponent(email)}&select=id`, { headers: h })).json();
    for (const { id } of rows) {
      await fetch(`${SUPABASE_URL}/rest/v1/notifications?booking_id=eq.${id}`, { method: "DELETE", headers: h });
      await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${id}`, { method: "DELETE", headers: h });
    }
    await fetch(`${SUPABASE_URL}/rest/v1/booking_attempts?email=eq.${encodeURIComponent(email)}`, { method: "DELETE", headers: h });
  }
}
test.afterAll(cleanup);

test("la page d'une presta affiche ses infos et sa prestation", async ({ page }) => {
  await page.goto("/staging-demo");
  await expect(page).toHaveTitle(/Démo Staging/);
  await expect(page.getByText("Paris 15e").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Pose vernis/ })).toBeVisible();
  // Adresse confidentielle : jamais affichée sur la page publique.
  await expect(page.getByText(/rue /i)).toHaveCount(0);
});

test("réserver un créneau de bout en bout", async ({ page }, testInfo) => {
  const email = `delivered+pw-${RUN}-${testInfo.project.name}@resend.dev`;
  emails.push(email);

  await page.goto("/staging-demo");
  await page.getByRole("button", { name: /Pose vernis/ }).click();
  // Deux boutons existent (barre fixe sur mobile) : on prend celui qui est visible.
  await page.locator("button:visible", { hasText: "Choisir un créneau" }).first().click();
  await expect(page.getByText("Quand souhaitez-vous venir ?")).toBeVisible();

  // Premier jour disponible (le mois suivant si le mois courant est complet).
  let day = page.getByRole("button", { name: /— Disponible$/ }).first();
  if (!(await day.count())) {
    await page.getByRole("button", { name: "Mois suivant" }).click();
    day = page.getByRole("button", { name: /— Disponible$/ }).first();
  }
  await day.click();

  // Dernier créneau du jour : évite de gêner les autres tests.
  const slots = page.getByRole("button", { name: /^\d{2}:\d{2}$/ });
  await expect(slots.first()).toBeVisible();
  const slot = slots.last();
  const time = (await slot.textContent())?.trim();
  await slot.click();
  await page.locator("button:visible", { hasText: "Confirmer ce créneau" }).first().click();

  await expect(page.getByText("À quel nom réserver ?")).toBeVisible();
  await page.getByPlaceholder("Camille Laurent").fill("Test Playwright");
  await page.getByPlaceholder("06 12 34 56 78").fill("0600000004");
  await page.getByPlaceholder("camille@mail.com").fill(email);
  await page.locator("button:visible", { hasText: "Réserver" }).last().click();

  await expect(page.getByText("C'est réservé !")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(email)).toBeVisible();
  if (time) await expect(page.getByText(time).first()).toBeVisible();
});

test("un slug inconnu renvoie une 404", async ({ page }) => {
  const res = await page.goto("/presta-qui-n-existe-pas-e2e");
  expect(res?.status()).toBe(404);
});
