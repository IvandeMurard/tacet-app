import { test, expect } from "@playwright/test";

test.describe("Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: "Nous contacter" })).toBeVisible();
  });

  test("displays type selector, message and email fields", async ({ page }) => {
    await expect(page.getByRole("radio", { name: /Feedback/i })).toBeVisible();
    await expect(page.getByRole("radio", { name: /B2B/i })).toBeVisible();
    await expect(page.getByLabel("Message")).toBeVisible();
    await expect(page.getByLabel(/adresse e-mail/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Envoyer/i })).toBeVisible();
  });

  test("selecting B2B type reveals organisation field", async ({ page }) => {
    await expect(page.getByLabel(/Organisation/i)).not.toBeVisible();
    await page.getByRole("radio", { name: /B2B/i }).check();
    await expect(page.getByLabel(/Organisation/i)).toBeVisible();
  });

  test("can fill all fields in B2B mode", async ({ page }) => {
    await page.getByRole("radio", { name: /B2B/i }).check();
    await page.getByLabel(/Organisation/i).fill("Mairie de Paris");
    await page.getByLabel("Message").fill("Demande d'accès aux données IRIS pour analyse urbaine");
    await page.getByLabel(/adresse e-mail/i).fill("contact@paris.fr");

    await expect(page.getByLabel(/Organisation/i)).toHaveValue("Mairie de Paris");
    await expect(page.getByLabel("Message")).toHaveValue(
      "Demande d'accès aux données IRIS pour analyse urbaine"
    );
    await expect(page.getByLabel(/adresse e-mail/i)).toHaveValue("contact@paris.fr");
  });

  // Story 5.4: form submits via HTTPS POST (not mailto:) and shows success state
  test("submitting form POSTs to /api/contact and shows success message", async ({ page }) => {
    // Mock the API route so no real email is sent in tests
    await page.route("/api/contact", (route) => {
      route.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });

    await page.goto("/contact");
    await page.getByLabel("Message").fill("Message de test avec plus de dix caractères.");
    await page.getByRole("button", { name: /Envoyer/i }).click();

    // Success state — no mailto:, no "client de messagerie"
    await expect(page.getByText(/Message envoyé/i)).toBeVisible({ timeout: 5000 });
  });

  // Story 5.4: server error is surfaced to the user
  test("shows error message on API failure", async ({ page }) => {
    await page.route("/api/contact", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: '{"error":"Erreur d\'envoi. Réessayez dans quelques instants."}',
      });
    });

    await page.goto("/contact");
    await page.getByLabel("Message").fill("Message de test avec plus de dix caractères.");
    await page.getByRole("button", { name: /Envoyer/i }).click();

    await expect(page.getByText(/Erreur d'envoi/i)).toBeVisible({ timeout: 5000 });
  });

  test("has back to map link", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Retour/i })).toBeVisible();
  });
});
