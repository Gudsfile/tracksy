import astroEslintParser from "eslint-plugin-astro";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["node_modules", "dist"],
  },
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: astroEslintParser.parser,
    },
    rules: {
      ...astroEslintParser.configs.recommended.rules,
      // Add or override Astro-specific rules
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
    },
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
    },
    rules: {
      ...typescriptEslintPlugin.configs.recommended.rules,
    },
  },
];
