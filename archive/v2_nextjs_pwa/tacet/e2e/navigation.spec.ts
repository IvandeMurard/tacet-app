import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("home has nav links to barometre and elections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Baromètre/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Élections 2026/ })).toBeVisible();
  });

  test("footer has mentions legales and contact", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Mentions légales" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Nous contacter" })).toBeVisible();
  });

  test("elections page loads", async ({ page }) => {
    await page.goto("/elections");
    await expect(page).toHaveURL(/\/elections/);
  });
});
