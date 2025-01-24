import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["tsconfig.json", "tsconfig.dev.json"],
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      "no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // Global ignore patterns
    ignores: ["lib/**/*", "generated/**/*"],
  },
);
