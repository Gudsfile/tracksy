import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import astroEslintParser from 'eslint-plugin-astro'

export default [
    {
        ignores: ['node_modules', 'dist'],
    },
    ...astroEslintParser.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: typescriptParser,
        },
        plugins: {
            '@typescript-eslint': typescriptEslintPlugin,
        },
        rules: {
            ...typescriptEslintPlugin.configs.recommended.rules,
        },
    },
]
