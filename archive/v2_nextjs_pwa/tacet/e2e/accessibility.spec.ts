import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("accessible view page loads with table", async ({ page }) => {
    const res = await page.goto("/accessible");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Vue accessible", { timeout: 10000 });
    await expect(page.getByRole("table")).toBeVisible({ timeout: 10000 });
  });

  test("footer has Vue accessible link", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Vue accessible" })).toBeVisible({ timeout: 8000 });
  });

  test("navigating to accessible from footer", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Vue accessible" }).click();
    await expect(page).toHaveURL(/\/accessible/);
    await expect(page.getByRole("table")).toBeVisible({ timeout: 15000 });
  });
});
