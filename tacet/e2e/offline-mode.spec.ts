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
});
