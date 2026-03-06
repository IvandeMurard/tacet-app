import { test, expect } from "@playwright/test";

test.describe("Address search", () => {
  test("search bar is visible on map page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("search")).toBeVisible();
    await expect(page.getByPlaceholder(/Rechercher une adresse/)).toBeVisible();
  });

  test("typing in search shows placeholder and input", async ({ page }) => {
    await page.goto("/");
    const input = page.getByPlaceholder(/Rechercher une adresse/);
    await input.fill("rue de rivoli");
    await expect(input).toHaveValue("rue de rivoli");
  });
});
