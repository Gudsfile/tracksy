import { expect, it } from "vitest";
import { isChromiumBrowser } from "./isChromiumBrowser";

it("should return true when browserName is chromium", () => {
  expect(isChromiumBrowser("chromium")).toBe(true);
});

it("should return false when browserName is firefox", () => {
  expect(isChromiumBrowser("firefox")).toBe(false);
});

it("should return false when browserName is webkit", () => {
  expect(isChromiumBrowser("webkit")).toBe(false);
});

it("should return false for undefined or empty strings", () => {
  expect(isChromiumBrowser("")).toBe(false);
  expect(isChromiumBrowser(undefined as any)).toBe(false);
});
