import { test, expect } from "@playwright/test";

test.describe("Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
    // Wait for page heading to confirm page loaded
    await expect(page.getByRole("heading", { name: "Nous contacter" })).toBeVisible();
  });

  test("displays contact form with required fields", async ({ page }) => {
    await expect(page.getByLabel("Message")).toBeVisible();
    await expect(page.getByLabel(/adresse e-mail/i)).toBeVisible();
    // Button text uses submit type
    await expect(page.getByRole("button", { name: /e-mail/i })).toBeVisible();
  });

  test("can fill in message and email fields", async ({ page }) => {
    const messageField = page.getByLabel("Message");
    const emailField = page.getByLabel(/adresse e-mail/i);

    await messageField.fill("Test message pour Tacet");
    await emailField.fill("test@example.fr");

    await expect(messageField).toHaveValue("Test message pour Tacet");
    await expect(emailField).toHaveValue("test@example.fr");
  });

  test("shows confirmation after form submit", async ({ page }) => {
    // Fill required message field
    await page.getByLabel("Message").fill("Un message de test");

    // Submit the form — triggers mailto: which Playwright ignores
    await page.getByRole("button", { name: /e-mail/i }).click();

    // After submit, the component shows a confirmation paragraph
    await expect(page.getByText(/client de messagerie/)).toBeVisible({ timeout: 10000 });
  });

  test("has back to map link", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Retour/i })).toBeVisible();
  });
});
