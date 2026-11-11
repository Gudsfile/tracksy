import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

export default [
    {
        ignores: ['node_modules', 'dist', 'coverage'],
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: typescriptParser,
        },
        plugins: {
            '@typescript-eslint': typescriptEslintPlugin,
        },
        rules: {
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
            // The package must stay extractable: no bundler globals, no browser
            // storage, no framework coupling. These are the couplings that would
            // silently creep in, so they fail the lint instead.
            'no-restricted-globals': [
                'error',
                {
                    name: 'localStorage',
                    message:
                        'webllm-otel must not depend on browser storage — expose a callback and let the consumer persist.',
                },
                {
                    name: 'window',
                    message:
                        'webllm-otel must stay framework- and DOM-agnostic — expose a callback instead of touching window.',
                },
            ],
            'no-restricted-properties': [
                'error',
                {
                    object: 'import',
                    property: 'meta',
                    message:
                        'webllm-otel must not read bundler env (import.meta.env) — take an `enabled` option instead.',
                },
            ],
        },
    },
]
