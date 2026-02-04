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
  await expect(page.getByText("2025")).toHaveCount(1);
  await page.getByRole("slider").fill("2025");
  await expect(page.getByText("2025")).toHaveCount(2);

  /* Concentration Score Card */
  await expect(
    page.getByRole("heading", {
      name: /Concentration Score/,
    })
  ).toBeVisible();

  await expect(page.getByRole("listitem").filter({ hasText: "Top 5" })).toContainText("25.0%");

  await expect(page.getByRole("listitem").filter({ hasText: "Top 10" })).toContainText("37.8%");

  await expect(page.getByRole("listitem").filter({ hasText: "Top 20" })).toContainText("55.8%");

  /* Loyalty vs Discovery Card */
  const loyaltyCard = page.locator(".group").filter({
    has: page.getByRole("heading", { name: /Loyalty vs Discovery/ }),
  });
  await expect(loyaltyCard).toBeVisible();

  // Check Loyalty contents
  await expect(loyaltyCard.getByText("Explorer").first()).toBeVisible();
  await expect(loyaltyCard.getByRole("listitem").filter({ hasText: "Artists" })).toContainText("79");
  await expect(loyaltyCard.getByRole("listitem").filter({ hasText: "Streams" })).toContainText("172");

  /* Listening Rhythm Card */
  await expect(page.getByRole("heading", { name: /Listening Rhythm/ })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Morning" })).toContainText("39.5%");
  await expect(page.getByRole("listitem").filter({ hasText: "Night" })).toContainText("14.0%");

  /* Listening Regularity Card */
  await expect(page.getByRole("heading", { name: /Listening Regularity/ })).toBeVisible();
  await expect(page.getByText("Regular", { exact: true })).toBeVisible();
  await expect(page.getByText("134 / 365 days")).toBeVisible();
  await expect(page.getByText("37%")).toBeVisible();

  /* Evolution Card */
  await expect(page.getByRole("heading", { name: /Evolution/ })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Total streams" })).toContainText("746");
  await expect(page.getByRole("listitem").filter({ hasText: "This year" })).toContainText("172");

  /* Seasonal patterns Card */
  await expect(page.getByRole("heading", { name: /Seasonal patterns/ })).toBeVisible();
  await expect(page.getByText("Your favorite season: Fall")).toBeVisible();
  // We can also check the list item for Fall
  await expect(page.getByRole("listitem").filter({ hasText: "Winter" })).toContainText("23.3%");
  await expect(page.getByRole("listitem").filter({ hasText: "Summer" })).toContainText("17.4%");

  /* New vs Old Card */
  await expect(page.getByRole("heading", { name: /New vs Old/ })).toBeVisible();
  await expect(page.getByText("9 new artists discovered this year!")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Découvertes" })).toContainText("11%");

  /* Listening Patience Card */
  await expect(page.getByRole("heading", { name: /Listening Patience/ })).toBeVisible();
  await expect(page.getByText("100.0%")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Completed" })).toContainText("172");

  /* Repeat Behavior Card */
  await expect(page.getByRole("heading", { name: /Repeat Behavior/ })).toBeVisible();
  await expect(page.getByText("Variated")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Repeat average" })).toContainText("2.0 times");

  /* Listening Devices Card */
  await expect(page.getByRole("heading", { name: /Listening Devices/ })).toBeVisible();
  await expect(page.getByText("Main platform")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Windows" })).toContainText("40.7%");

  /* Favorite Weekday Card */
  await expect(page.getByRole("heading", { name: /Favorite Weekday/ })).toBeVisible();
  await expect(page.getByText("Tuesday").first()).toBeVisible();
  await expect(page.getByText("31 streams")).toBeVisible();
});
