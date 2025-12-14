import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import astroEslintParser from 'eslint-plugin-astro'
import eslintPluginImport from 'eslint-plugin-import'

export default [
    {
        ignores: ['node_modules', 'dist', 'coverage', '.astro'],
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
            'no-restricted-syntax': [
                'error',
                {
                    selector:
                        "CallExpression[callee.object.name='vi'][callee.property.name='mock']",
                    message:
                        'Do not use vi.mock(). Use vi.spyOn() instead to verify calls or mock implementations on pure functions.',
                },
            ],
        },
    },
]
