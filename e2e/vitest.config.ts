/// <reference types="vitest" />
import { coverageConfigDefaults } from "vitest/config";

const config = {
  test: {
    environment: "node",
    setupFiles: "./vitest.setupFiles.ts",
    include: ["**/*.test.?(c|m)[jt]s?(x)"],
    exclude: ["**/node_modules/**", "**/tests/**"],
    sequence: { shuffle: true },
    passWithNoTests: false,
    coverage: {
      reporter: ["text"],
      exclude: [...coverageConfigDefaults.exclude],
    },
    restoreMocks: true,
  },
};

/**
 * We disable this rule because vitest expect default export
 * @see https://vitest.dev/config/
 */
// eslint-disable-next-line import/no-default-export
export default config;
