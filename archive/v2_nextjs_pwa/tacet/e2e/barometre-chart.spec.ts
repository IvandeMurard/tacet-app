import { test, expect } from "@playwright/test";

test.describe("Baromètre Chart", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/barometre");
  });

  test("displays page heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Baromètre/i })).toBeVisible();
  });

  test("loads arrondissement ranking list", async ({ page }) => {
    // Wait for ranking to load (replaces loading spinner)
    const ranking = page.getByRole("list", { name: /Classement arrondissements/i });
    await expect(ranking).toBeVisible({ timeout: 10000 });

    // Should have 20 arrondissements
    const items = ranking.getByRole("listitem");
    await expect(items).toHaveCount(20);
  });

  test("ranking items show arrondissement label and score", async ({ page }) => {
    const ranking = page.getByRole("list", { name: /Classement arrondissements/i });
    await expect(ranking).toBeVisible({ timeout: 10000 });

    // First item should contain an arrondissement label (e.g. "16e arr.")
    const firstItem = ranking.getByRole("listitem").first();
    await expect(firstItem).toContainText(/arr\./);
    // Should contain a score value followed by /100
    await expect(firstItem).toContainText(/\/100/);
  });

  test("has share button", async ({ page }) => {
    const ranking = page.getByRole("list", { name: /Classement arrondissements/i });
    await expect(ranking).toBeVisible({ timeout: 10000 });

    await expect(page.getByRole("button", { name: /Partager ce classement/i })).toBeVisible();
  });

  test("has link back to map", async ({ page }) => {
    const ranking = page.getByRole("list", { name: /Classement arrondissements/i });
    await expect(ranking).toBeVisible({ timeout: 10000 });

    await expect(page.getByRole("link", { name: /Explorer la carte/i })).toBeVisible();
  });
});
