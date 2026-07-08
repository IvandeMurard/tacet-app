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

  // Story 5.6: last visited zone is auto-restored on page load (useRestoreLastZone)
  test("last visited zone IrisPopup auto-restores from localStorage", async ({ page }) => {
    await page.goto("/");

    // Inject a last-visited zone directly into localStorage (same key as MapContext)
    await page.evaluate(() => {
      localStorage.setItem(
        "tacet-last-zone",
        JSON.stringify({
          code_iris: "751010000",
          name: "Zone Test IRIS",
          c_ar: 1,
          noise_level: 2,
        })
      );
    });

    // Reload — useRestoreLastZone reads localStorage and calls setSelectedZone
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByRole("dialog", { name: /Informations sonores/ })
    ).toBeVisible({ timeout: 8000 });
  });

  // Story 5.6: closing IrisPopup removes it from view
  test("closing IrisPopup dismisses the dialog", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "tacet-last-zone",
        JSON.stringify({ code_iris: "751010000", name: "Zone Test", c_ar: 1, noise_level: 1 })
      );
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    const dialog = page.getByRole("dialog", { name: /Informations sonores/ });
    await expect(dialog).toBeVisible({ timeout: 8000 });

    await page.getByRole("button", { name: "Fermer" }).click();
    await expect(dialog).not.toBeVisible({ timeout: 3000 });
  });
});
