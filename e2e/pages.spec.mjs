// Page web : contrôles du cahier de tests (WEB-*, NR-14 à NR-21, TRIAL-02, PRO-07),
// sur la preview STAGING. Les RDV créés sont supprimés à la fin.
import { test, expect } from "@playwright/test";

const SUPABASE_URL = process.env.STAGING_SUPABASE_URL ?? "https://xhalwjciuecctxiykiks.supabase.co";
const SERVICE_KEY = process.env.STAGING_SERVICE_KEY;
if (SUPABASE_URL.includes("flrtdhzcimbkbcgczmea")) throw new Error("Refus : jamais sur la prod.");
const RUN = Date.now();
const emails = [];
const admin = (path, init = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, ...(init.headers ?? {}) } });

test.afterAll(async () => {
  if (!SERVICE_KEY) return;
  for (const email of emails) {
    const rows = await (await admin(`bookings?client_email=eq.${encodeURIComponent(email)}&select=id`)).json();
    for (const { id } of rows) {
      await admin(`notifications?booking_id=eq.${id}`, { method: "DELETE" });
      await admin(`bookings?id=eq.${id}`, { method: "DELETE" });
    }
    await admin(`booking_attempts?email=eq.${encodeURIComponent(email)}`, { method: "DELETE" });
  }
});

const visible = (page, text) => page.locator("button:visible", { hasText: text }).first();

// Va jusqu'à l'étape Coordonnées sur le dernier créneau du premier jour libre.
async function goToContact(page) {
  await page.goto("/staging-demo");
  await page.getByRole("button", { name: /Pose vernis/ }).click();
  await visible(page, "Choisir un créneau").click();
  let day = page.getByRole("button", { name: /— Disponible$/ }).first();
  if (!(await day.count())) {
    await page.getByRole("button", { name: "Mois suivant" }).click();
    day = page.getByRole("button", { name: /— Disponible$/ }).first();
  }
  await day.click();
  const slots = page.getByRole("button", { name: /^\d{2}:\d{2}$/ });
  await expect(slots.first()).toBeVisible();
  const time = (await slots.last().textContent())?.trim();
  await slots.last().click();
  await visible(page, "Confirmer ce créneau").click();
  await expect(page.getByText("À quel nom réserver ?")).toBeVisible();
  return { time };
}

test("TRIAL-02 / WEB-04 essai expiré : page « momentanément indisponible »", async ({ page }) => {
  const res = await page.goto("/staging-expire");
  expect(res?.status()).toBeLessThan(400);
  await expect(page.getByText("La réservation en ligne est momentanément indisponible.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Choisir un créneau/ })).toHaveCount(0);
});

test("PRO-07 aperçu du lien : titre et Open Graph", async ({ page }) => {
  await page.goto("/staging-demo");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Démo Staging – Réservation en ligne");
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Book Me Again");
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /.{10,}/);
});

test("WEB-18 pages de confidentialité FR et EN, sans Twilio", async ({ page }) => {
  for (const path of ["/privacy", "/privacy/en"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    await expect(page.locator("body")).not.toContainText(/Twilio|BookMi\b/);
  }
});

test("NR-21 page d'accueil et signature", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Book Me Again/);
  await expect(page.locator("body")).toContainText("13,99 €");
  await expect(page.locator("body")).not.toContainText(/Get started by editing|BookMi\b/);
  await page.goto("/staging-demo");
  await expect(page.getByText("Vous êtes prestataire ? Créez votre page")).toBeVisible();
});

test("NR-19 ambiance de la presta appliquée", async ({ page }) => {
  await page.goto("/staging-demo");
  await expect(page.locator("main").first()).toHaveAttribute("style", /--t-/);
});

test("NR-20 mobile : bouton « Choisir un créneau » fixe en bas", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile seulement");
  await page.goto("/staging-demo");
  await page.getByRole("button", { name: /Pose vernis/ }).click();
  const btn = visible(page, "Choisir un créneau");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(btn).toBeInViewport();
  const box = await btn.boundingBox();
  const vh = page.viewportSize().height;
  expect(box.y + box.height).toBeGreaterThan(vh - 120);
  // Bio repliée à 3 lignes quand elle est longue.
  const more = page.getByRole("button", { name: "Lire la suite" });
  if (await more.count()) {
    await more.click();
    await expect(page.getByRole("button", { name: "Réduire" })).toBeVisible();
  }
});

test("WEB-07 calendrier : impossible d'aller au-delà de l'horizon", async ({ page }) => {
  await page.goto("/staging-demo");
  await page.getByRole("button", { name: /Pose vernis/ }).click();
  await visible(page, "Choisir un créneau").click();
  const next = page.getByRole("button", { name: "Mois suivant" });
  let blocked = false;
  for (let i = 0; i < 14 && !blocked; i++) {
    if (await next.isDisabled()) blocked = true;
    else await next.click();
  }
  expect(blocked, "le bouton « Mois suivant » doit se bloquer à l'horizon (3 mois par défaut)").toBe(true);
  await expect(page.getByRole("button", { name: /— Disponible$/ })).toHaveCount(0);
});

test("WEB-09 / WEB-12 formulaire : erreurs claires et récapitulatif juste", async ({ page }) => {
  const { time } = await goToContact(page);
  const submit = visible(page, "Réserver");
  await expect(submit).toBeDisabled();
  await page.getByPlaceholder("camille@mail.com").fill("abc@");
  await page.getByPlaceholder("camille@mail.com").blur();
  await expect(page.getByText(/Adresse email invalide/)).toBeVisible();
  await page.getByPlaceholder("Camille Laurent").fill("Test Playwright");
  await page.getByPlaceholder("06 12 34 56 78").fill("0600000004");
  await expect(submit).toBeDisabled();
  // Récapitulatif : prestation, prix, heure, ville (jamais l'adresse exacte).
  const body = page.locator("body");
  await expect(body).toContainText("Pose vernis");
  await expect(body).toContainText("35,50");
  if (time) await expect(body).toContainText(time);
  await expect(body).not.toContainText(/\d+ rue /i);
});

test("WEB-15 bouton retour : étape précédente, choix conservé", async ({ page }) => {
  await goToContact(page);
  await page.goBack();
  await expect(page.getByText("Quand souhaitez-vous venir ?")).toBeVisible();
  await page.goBack();
  await expect(page.getByText("Que souhaitez-vous réserver ?")).toBeVisible();
  await expect(page).toHaveURL(/staging-demo/);
});

test("WEB-16 créneau pris entre-temps : retour au choix, coordonnées conservées", async ({ page }) => {
  await goToContact(page);
  await page.route("**/functions/v1/bookings", (route) =>
    route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ error: "Ce créneau n'est plus disponible." }) }));
  await page.getByPlaceholder("Camille Laurent").fill("Test Conflit");
  await page.getByPlaceholder("06 12 34 56 78").fill("0600000004");
  await page.getByPlaceholder("camille@mail.com").fill("conflit@example.com");
  await visible(page, "Réserver").click();
  await expect(page.getByText(/n'est plus disponible/)).toBeVisible();
  await expect(page.getByText("Quand souhaitez-vous venir ?")).toBeVisible();
  await page.unroute("**/functions/v1/bookings");
  const slots = page.getByRole("button", { name: /^\d{2}:\d{2}$/ });
  if (await slots.count()) {
    await slots.last().click();
    await visible(page, "Confirmer ce créneau").click();
    await expect(page.getByPlaceholder("camille@mail.com")).toHaveValue("conflit@example.com");
  }
});

test("WEB-19 coupure réseau : message, pas de page blanche", async ({ page, context }) => {
  await page.goto("/staging-demo");
  await page.getByRole("button", { name: /Pose vernis/ }).click();
  await visible(page, "Choisir un créneau").click();
  await expect(page.getByText("Quand souhaitez-vous venir ?")).toBeVisible();
  await context.setOffline(true);
  await page.getByRole("button", { name: "Mois suivant" }).click();
  await expect(page.getByText(/Disponibilités indisponibles pour le moment/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Quand souhaitez-vous venir ?")).toBeVisible();
  await context.setOffline(false);
});

test("WEB-11 / WEB-13 double clic et email en majuscules : un seul RDV, email normalisé", async ({ page }, testInfo) => {
  test.skip(!SERVICE_KEY, "STAGING_SERVICE_KEY absent");
  const email = `delivered+pw2-${RUN}-${testInfo.project.name}@resend.dev`;
  emails.push(email);
  await goToContact(page);
  await page.getByPlaceholder("Camille Laurent").fill("Test Double Clic");
  await page.getByPlaceholder("06 12 34 56 78").fill("0600000004");
  await page.getByPlaceholder("camille@mail.com").fill(`  ${email.toUpperCase()}  `);
  await visible(page, "Réserver").dblclick();
  await expect(page.getByText("C'est réservé !")).toBeVisible({ timeout: 20_000 });
  const rows = await (await admin(`bookings?client_email=ilike.${encodeURIComponent(email)}&select=client_email`)).json();
  expect(rows.length, "un seul RDV créé").toBe(1);
  expect(rows[0].client_email).toBe(email);
});

test("WEB-05 ancienne adresse vercel.app : redirection vers bookmeagain.com (lecture seule)", async ({ request }) => {
  const res = await request.get("https://bookme-client-umber.vercel.app/staging-demo", { maxRedirects: 0 });
  expect([301, 302, 307, 308]).toContain(res.status());
  expect(res.headers()["location"] ?? "").toMatch(/^https:\/\/bookmeagain\.com\//);
});
