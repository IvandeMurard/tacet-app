import { test, expect } from "@playwright/test";

test.describe("Score display", () => {
  test("barometre page shows ranking title", async ({ page }) => {
    await page.goto("/barometre");
    await expect(page.getByRole("heading", { name: /Baromètre du Silence/ })).toBeVisible();
  });

  test("barometre page has link back to map", async ({ page }) => {
    await page.goto("/barometre");
    await expect(page.getByRole("link", { name: /Retour à la carte|Carte/ })).toBeVisible();
  });
});
