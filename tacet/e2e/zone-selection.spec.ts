import { test, expect } from "@playwright/test";

test.describe("Zone selection", () => {
  test("map has role application", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("application", { name: /Carte du bruit/ })).toBeVisible();
  });

  test("legend is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("list", { name: /Légende/ })).toBeVisible();
  });
});
