import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import astroEslintParser from 'eslint-plugin-astro'
import eslintPluginImport from 'eslint-plugin-import'

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
            import: eslintPluginImport,
        },
        rules: {
            'import/no-default-export': 'error',
            ...typescriptEslintPlugin.configs.recommended.rules,
        },
    },
]
