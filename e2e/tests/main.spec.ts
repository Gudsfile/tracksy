// FIXME: download the dataset from hugging face and use it instead of the zip file https://github.com/Gudsfile/tracksy/issues/242

import { test, expect } from "@playwright/test";
import * as path from "path";

test("has title and can upload dataset", async ({ page }) => {
  await page.goto(process.env.TEST_PATH || "/tracksy");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Tracksy/);

  // Expect anchor under h1 with text "Tracksy" to be visible
  await expect(page.locator("h1").getByRole("link", { name: "Tracksy" })).toBeVisible();

  // Upload the zip file
  // Note: We use relative path from the test file to the dataset
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(path.join(__dirname, "../datasets/spotify/streamings_1000.zip"));

  // Simple view assertions
  const simpleViewTab = page.getByRole("tab", { name: /Simple View/ });
  await expect(simpleViewTab).toBeVisible();

  // Assert it is active (selected)
  await expect(simpleViewTab).toHaveAttribute("aria-selected", "true");

  // Select 2025 on slider
  await expect(page.getByText("2025", { exact: true })).toHaveCount(0);
  await page.getByRole("slider").fill("2025");
  await expect(page.getByText("2025", { exact: true })).toHaveCount(1);

  /* Top Tracks Card */
  const topTracksCard = page.locator(".group").filter({
    has: page.getByRole("heading", { name: /Top Tracks/ }),
  });
  await expect(topTracksCard).toBeVisible();

  await expect(topTracksCard.getByRole("listitem").filter({ hasText: "Property Simply Break" })).toBeVisible();
  await expect(topTracksCard.getByRole("listitem").filter({ hasText: "Property Simply Break" })).toContainText("🥇");
  await expect(topTracksCard.getByRole("listitem").filter({ hasText: "Property Simply Break" })).toContainText("Property Simply Break Could");
  await expect(topTracksCard.getByRole("listitem").filter({ hasText: "Property Simply Break" })).toContainText("Norma Roberts");
  await expect(topTracksCard.getByRole("listitem").filter({ hasText: "Property Simply Break" })).toContainText("15");

  /* Top Artists Card */
  const topArtistsCard = page.locator(".group").filter({
    has: page.getByRole("heading", { name: /Top Artists/ }),
  });
  await expect(topArtistsCard).toBeVisible();
  await expect(topArtistsCard.getByRole("listitem").filter({ hasText: "Jeffrey Mathis" })).toBeVisible();
  await expect(topArtistsCard.getByRole("listitem").filter({ hasText: "Jeffrey Mathis" })).toContainText("🥈");
  await expect(topArtistsCard.getByRole("listitem").filter({ hasText: "Jeffrey Mathis" })).toContainText("21m");
  await expect(topArtistsCard.getByRole("listitem").filter({ hasText: "Jeffrey Mathis" })).toContainText("8");

  /* Top Albums Card */
  const topAlbumsCard = page.locator(".group").filter({
    has: page.getByRole("heading", { name: /Top Albums/ }),
  });
  await expect(topAlbumsCard).toBeVisible();
  await expect(topAlbumsCard.getByRole("listitem").filter({ hasText: "Hand Growth After" })).toBeVisible();
  await expect(topAlbumsCard.getByRole("listitem").filter({ hasText: "Hand Growth After" })).toContainText("5️⃣");
  await expect(topAlbumsCard.getByRole("listitem").filter({ hasText: "Hand Growth After" })).toContainText("Kayla Richardson");
  await expect(topAlbumsCard.getByRole("listitem").filter({ hasText: "Hand Growth After" })).toContainText("4");

  /* Focus Mode Card */
  await expect(page.getByRole("heading", { name: /Focus Mode/ })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Top 5" })).toContainText("25.0%");
  await expect(page.getByRole("listitem").filter({ hasText: "Top 10" })).toContainText("37.8%");
  await expect(page.getByRole("listitem").filter({ hasText: "Top 20" })).toContainText("55.8%");

  /* Artist Loyalty Card */
  const loyaltyCard = page.locator(".group").filter({
    has: page.getByRole("heading", { name: /Artist Loyalty/ }),
  });
  await expect(loyaltyCard).toBeVisible();
  await expect(loyaltyCard.getByText("Explorer")).toBeVisible();
  await expect(loyaltyCard.getByText("1 stream26%")).toBeVisible();
  await expect(loyaltyCard.getByText("2-10 streams63%")).toBeVisible();
  await expect(loyaltyCard.getByText("11-100 streams11%")).toBeVisible();
  await expect(loyaltyCard.getByText("101-1000 streams0%")).toBeVisible();
  await expect(loyaltyCard.getByText("1000+ streams0%")).toBeVisible();

  /* Daily Vibes Card */
  await expect(page.getByRole("heading", { name: /Daily Vibes/ })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Morning" })).toContainText("39.5%");
  await expect(page.getByRole("listitem").filter({ hasText: "Night" })).toContainText("14.0%");

  /* Consistency Meter Card */
  await expect(page.getByRole("heading", { name: /Consistency Meter/ })).toBeVisible();
  await expect(page.getByText("Occasional", { exact: true })).toBeVisible();
  await expect(page.getByText("134 / 365 days")).toBeVisible();
  await expect(page.getByText("37%")).toBeVisible();

  /* Soundtrack Growth */
  await expect(page.getByRole("heading", { name: /Soundtrack Growth/ })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Total streams" })).toContainText("746");
  await expect(page.getByRole("listitem").filter({ hasText: "This year" })).toContainText("172");

  /* Seasonal Mood Card */
  await expect(page.getByRole("heading", { name: /Seasonal Mood/ })).toBeVisible();
  await expect(page.getByText('Fall54 streams🍂')).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Winter" })).toContainText("23.3%");
  await expect(page.getByRole("listitem").filter({ hasText: "Summer" })).toContainText("17.4%");

  /* Fresh vs Familiar Card */
  await expect(page.getByRole("heading", { name: /Fresh vs Familiar/ })).toBeVisible();
  await expect(page.getByText("9 new artists discovered this year!")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Discoveries" })).toContainText("11%");

  /* Skip Mood Card */
  await expect(page.getByRole("heading", { name: /Skip Mood/ })).toBeVisible();
  await expect(page.getByText("100.0%")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Completed" })).toContainText("172");

  /* Replay Energy Card */
  await expect(page.getByRole("heading", { name: /Replay Energy/ })).toBeVisible();
  await expect(page.getByText("Variated")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Repeat average" })).toContainText("2.0 times");

  /* Your Sound Machine Card */
  await expect(page.getByRole("heading", { name: /Your Sound Machine/ })).toBeVisible();
  await expect(page.getByText("Windows")).toHaveCount(2);
  await expect(page.getByText('70 streams')).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Windows" })).toContainText("40.7%");
  await expect(page.getByRole("listitem").filter({ hasText: "Others" })).toContainText("59.3%");

  /* Your Power Day Card */
  await expect(page.getByRole("heading", { name: /Your Power Day/ })).toBeVisible();
  await expect(page.getByText("Tuesday").first()).toBeVisible();
  await expect(page.getByText("31 streams")).toBeVisible();
});
