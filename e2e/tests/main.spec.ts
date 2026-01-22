// FIXME: download the dataset from hugging face and use it instead of the zip file https://github.com/Gudsfile/tracksy/issues/242

import { test, expect, chromium } from "@playwright/test";
import * as path from "path";

import { getTestPath } from "../helpers/getTestPath";

test("Go to application, upload dataset and visualize simple view", async ({
  page,
}) => {
  await page.goto(getTestPath());

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Tracksy/);

  // Expect anchor under h1 with text "Tracksy" to be visible
  await expect(
    page.locator("h1").getByRole("link", { name: "Tracksy" }),
  ).toBeVisible();

  // Upload the zip file
  // Note: We use relative path from the test file to the dataset
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(
    path.join(__dirname, "../datasets/streamings_1000.zip"),
  );

  // Simple view assertions
  const simpleViewTab = page.getByRole("tab", { name: /Simple View/ });
  await expect(simpleViewTab).toBeVisible();

  // Assert it is active (selected)
  await expect(simpleViewTab).toHaveAttribute("aria-selected", "true");

  /* Concentration Score Card */
  await expect(
    page.getByRole("heading", {
      name: /Concentration Score/,
    }),
  ).toBeVisible();

  await expect(
    page.getByRole("listitem").filter({ hasText: "Top 5" }),
  ).toContainText("31.1%");

  await expect(
    page.getByRole("listitem").filter({ hasText: "Top 10" }),
  ).toContainText("44.6%");

  await expect(
    page.getByRole("listitem").filter({ hasText: "Top 20" }),
  ).toContainText("63.5%");

  /* Loyalty vs Discovery Card */
  const loyaltyCard = page.locator(".group").filter({
    has: page.getByRole("heading", { name: /Loyalty vs Discovery/ }),
  });
  await expect(loyaltyCard).toBeVisible();

  // Check Loyalty contents
  await expect(loyaltyCard.getByText("Explorer").first()).toBeVisible();
  await expect(
    loyaltyCard.getByRole("listitem").filter({ hasText: "Artists" }),
  ).toContainText("47");
  await expect(
    loyaltyCard.getByRole("listitem").filter({ hasText: "Streams" }),
  ).toContainText("74");

  /* Listening Rhythm Card */
  await expect(
    page.getByRole("heading", { name: /Listening Rhythm/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("listitem").filter({ hasText: "Morning" }),
  ).toContainText("23.0%");
  await expect(
    page.getByRole("listitem").filter({ hasText: "Night" }),
  ).toContainText("39.2%");

  /* Listening Regularity Card */
  await expect(
    page.getByRole("heading", { name: /Listening Regularity/ }),
  ).toBeVisible();
  await expect(page.getByText("Occasional")).toBeVisible();
  await expect(page.getByText("66 / 354 days")).toBeVisible();
  await expect(page.getByText("19%")).toBeVisible();

  /* Evolution Card */
  await expect(page.getByRole("heading", { name: /Evolution/ })).toBeVisible();
  await expect(
    page.getByRole("listitem").filter({ hasText: "Total streams" }),
  ).toContainText("778");
  await expect(
    page.getByRole("listitem").filter({ hasText: "This year" }),
  ).toContainText("74");

  /* Seasonal patterns Card */
  await expect(
    page.getByRole("heading", { name: /Seasonal patterns/ }),
  ).toBeVisible();
  await expect(page.getByText("Your favorite season: Fall")).toBeVisible();
  // We can also check the list item for Fall
  await expect(
    page.getByRole("listitem").filter({ hasText: "Fall" }),
  ).toContainText("33.8%");

  /* New vs Old Card */
  await expect(page.getByRole("heading", { name: /New vs Old/ })).toBeVisible();
  await expect(
    page.getByText("5 new artists discovered this year!"),
  ).toBeVisible();
  await expect(
    page.getByRole("listitem").filter({ hasText: "Découvertes" }),
  ).toContainText("14%");

  /* Listening Patience Card */
  await expect(
    page.getByRole("heading", { name: /Listening Patience/ }),
  ).toBeVisible();
  await expect(page.getByText("100.0%")).toBeVisible();
  await expect(
    page.getByRole("listitem").filter({ hasText: "Completed" }),
  ).toContainText("74");

  /* Repeat Behavior Card */
  await expect(
    page.getByRole("heading", { name: /Repeat Behavior/ }),
  ).toBeVisible();
  await expect(page.getByText("Variated")).toBeVisible();
  await expect(
    page.getByRole("listitem").filter({ hasText: "Repeat average" }),
  ).toContainText("2.0 times");

  /* Listening Devices Card */
  await expect(
    page.getByRole("heading", { name: /Listening Devices/ }),
  ).toBeVisible();
  await expect(page.getByText("Main platform")).toBeVisible();
  await expect(
    page.getByRole("listitem").filter({ hasText: "Windows" }),
  ).toContainText("45.9%");

  /* Favorite Weekday Card */
  await expect(
    page.getByRole("heading", { name: /Favorite Weekday/ }),
  ).toBeVisible();
  await expect(page.getByText("Monday").first()).toBeVisible();
  await expect(page.getByText("13 streams")).toBeVisible();
});

test("lighthouse performance check", async ({ browserName }) => {
  // Lighthouse only supports Chromium
  test.skip(browserName !== "chromium", "Lighthouse only supports Chromium");

  const port = 9222;
  const browser = await chromium.launch({
    args: [`--remote-debugging-port=${port}`],
  });

  try {
    const page = await browser.newPage();
    const baseURL = process.env.URL || "http://localhost:4321";
    const testPath = process.env.TEST_PATH || "/tracksy";
    const url = testPath.startsWith("http")
      ? testPath
      : new URL(testPath, baseURL).toString();

    await page.goto(url);

    const { default: lighthouse } = await import("lighthouse");
    const { default: desktopConfig } =
      await import("lighthouse/core/config/desktop-config.js");

    const options = {
      logLevel: "info",
      output: "json",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      port,
    };

    // @ts-ignore
    const runnerResult = await lighthouse(url, options, desktopConfig);

    if (!runnerResult) throw new Error("Lighthouse failed to run");

    const report = runnerResult.report;
    const lhr = runnerResult.lhr;

    const fs = await import("fs");
    const path = await import("path");
    const reportDir = "playwright-report";
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(reportDir, `lighthouse-report-${Date.now()}.json`),
      report as string,
    );

    const thresholds = {
      performance: 54,
      accessibility: 98,
      "best-practices": 100,
      seo: 90,
    };

    for (const [category, threshold] of Object.entries(thresholds)) {
      const score = (lhr.categories[category].score || 0) * 100;
      console.log(`${category}: ${score}`);
      expect(
        score,
        `${category} score should be >= ${threshold}`,
      ).toBeGreaterThanOrEqual(threshold);
    }
  } finally {
    await browser.close();
  }
});
