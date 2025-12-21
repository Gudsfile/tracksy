/// <reference types="vitest" />
import { getViteConfig } from 'astro/config'
import { coverageConfigDefaults } from 'vitest/config'

const config = getViteConfig({
    // https://docs.astro.build/en/guides/testing/#vitest
    // @ts-expect-error regarding the types it test doesn't exist, but regarding the documentation it should work fine
    test: {
        environment: 'jsdom',
        setupFiles: './vitest.setupFiles.ts',
        include: ['**/*.test.?(c|m)[jt]s?(x)'],
        exclude: ['**/node_modules/**'],
        sequence: { shuffle: true },
        passWithNoTests: false,
        coverage: {
            reporter: ['text'],
            thresholds: {
                statements: 79,
                branches: 78,
                functions: 85,
                lines: 79,
            },
            exclude: [
                ...coverageConfigDefaults.exclude,
                'astro.config.*',
                'tailwind.config.*',
            ],
        },
        restoreMocks: true,
    },
})

/**
 * We disable this rule because vitest expect default export
 * @see https://vitest.dev/config/
 */
// eslint-disable-next-line import/no-default-export
export default config
