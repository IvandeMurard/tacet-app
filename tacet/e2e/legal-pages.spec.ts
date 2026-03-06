import { test, expect } from "@playwright/test";

test.describe("Legal and contact pages", () => {
  test("mentions legales page loads", async ({ page }) => {
    await page.goto("/mentions-legales");
    await expect(page.getByRole("heading", { name: /Mentions légales/ })).toBeVisible();
  });

  test("confidentialite page loads", async ({ page }) => {
    await page.goto("/confidentialite");
    await expect(page.getByRole("heading", { name: /Politique de confidentialité/ })).toBeVisible();
  });

  test("contact page has form", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: /Nous contacter/ })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /Message/ })).toBeVisible();
  });
});
