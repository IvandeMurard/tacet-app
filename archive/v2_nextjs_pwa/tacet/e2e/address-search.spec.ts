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

  // Story 5.6: address → suggestion selection → map flyTo → IrisPopup opens
  test("selecting a suggestion opens IrisPopup after map flyTo", async ({ page }) => {
    // Mock Photon geocoding to return a deterministic Paris location
    await page.route("**/photon.komoot.io/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          features: [
            {
              type: "Feature",
              geometry: { type: "Point", coordinates: [2.3522, 48.8566] },
              properties: {
                name: "Place de la République",
                city: "Paris",
                country: "France",
                district: "3e Arrondissement",
              },
            },
          ],
        }),
      });
    });

    await page.goto("/");
    // Wait for GeoJSON layers to load so queryRenderedFeatures returns results
    await page.waitForLoadState("networkidle");

    const input = page.getByPlaceholder(/Rechercher une adresse/);
    await input.fill("République");

    // Suggestions dropdown should appear
    const listbox = page.getByRole("listbox", { name: /Suggestions/ });
    await expect(listbox).toBeVisible({ timeout: 5000 });

    // Click the first suggestion button
    await listbox.locator('[role="option"] button').first().click();

    // IrisPopup dialog should open after flyTo + queryRenderedFeatures resolves
    await expect(
      page.getByRole("dialog", { name: /Informations sonores/ })
    ).toBeVisible({ timeout: 12000 });
  });

  // FR15: clearing search closes IrisPopup and resets selection
  test("clearing search closes IrisPopup (FR15)", async ({ page }) => {
    await page.route("**/photon.komoot.io/**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          features: [
            {
              type: "Feature",
              geometry: { type: "Point", coordinates: [2.3522, 48.8566] },
              properties: { name: "Place de la République", city: "Paris", country: "France" },
            },
          ],
        }),
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const input = page.getByPlaceholder(/Rechercher une adresse/);
    await input.fill("République");

    const listbox = page.getByRole("listbox", { name: /Suggestions/ });
    await expect(listbox).toBeVisible({ timeout: 5000 });
    await listbox.locator('[role="option"] button').first().click();

    await expect(
      page.getByRole("dialog", { name: /Informations sonores/ })
    ).toBeVisible({ timeout: 12000 });

    // Click the clear button — should dismiss popup and clear input
    await page.getByRole("button", { name: /Effacer la recherche/ }).click();
    await expect(input).toHaveValue("");
    await expect(
      page.getByRole("dialog", { name: /Informations sonores/ })
    ).not.toBeVisible({ timeout: 3000 });
  });
});
