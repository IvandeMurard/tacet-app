import { test, expect } from "@playwright/test";

test.describe("Offline mode", () => {
  test("offline banner appears when network is disabled", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await context.setOffline(true);
    await expect(
      page.getByRole("status").filter({ hasText: /hors ligne/i })
    ).toBeVisible({ timeout: 5000 });

    await context.setOffline(false);
    await expect(
      page.getByRole("status").filter({ hasText: /hors ligne/i })
    ).not.toBeVisible({ timeout: 5000 });
  });

  test("app shell loads with service worker cached", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hasMap = await page
      .getByRole("application", { name: /Carte du bruit/ })
      .isVisible();
    expect(hasMap).toBeTruthy();
  });

  // Story 5.6: offline reload → last zone IrisPopup auto-restores from localStorage
  test("last visited zone IrisPopup persists after going offline", async ({
    page,
    context,
  }) => {
    // Load the page once while online to prime the service worker cache
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Inject last-visited zone into localStorage
    await page.evaluate(() => {
      localStorage.setItem(
        "tacet-last-zone",
        JSON.stringify({ code_iris: "751010000", name: "Zone Test", c_ar: 1, noise_level: 2 })
      );
    });

    // Go offline and reload
    await context.setOffline(true);
    await page.reload();

    // App shell should still render from SW cache
    await expect(
      page.getByRole("application", { name: /Carte du bruit/ })
    ).toBeVisible({ timeout: 10000 });

    // IrisPopup should auto-restore from localStorage via useRestoreLastZone
    await expect(
      page.getByRole("dialog", { name: /Informations sonores/ })
    ).toBeVisible({ timeout: 10000 });

    await context.setOffline(false);
  });
});
