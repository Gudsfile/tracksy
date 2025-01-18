import { getViteConfig } from 'astro/config'
import { coverageConfigDefaults } from 'vitest/config'

const config = getViteConfig({
    test: {
        environment: 'jsdom',
        setupFiles: './vitest.setupFiles.ts',
        include: ['**/*.test.?(c|m)[jt]s?(x)'],
        exclude: ['**/node_modules/**'],
        sequence: { shuffle: true },
        passWithNoTests: false,
        coverage: {
            exclude: [
                ...coverageConfigDefaults.exclude,
                'astro.config.*',
                'tailwind.config.*',
            ],
        },
        restoreMocks: true,
    },
})

export default config
