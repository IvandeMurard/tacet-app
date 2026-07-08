import { test, expect } from "@playwright/test";

test.describe("Layer toggles", () => {
  test("Chantiers toggle is visible in AppNav", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("switch", { name: /chantiers/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test("Chantiers toggle activates on click", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("switch", { name: /chantiers/i });
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  test("Chantiers toggle deactivates on second click", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("switch", { name: /chantiers/i });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  test("legend shows chantiers disclosure", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/ne reflète pas les chantiers/i)
    ).toBeVisible({ timeout: 10000 });
  });
});
