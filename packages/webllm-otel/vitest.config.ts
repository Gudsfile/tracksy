import { defineConfig } from 'vitest/config'

/**
 * The library is framework-agnostic and touches no DOM APIs beyond `crypto`,
 * which Node provides globally — so the tests run in the plain node environment
 * rather than jsdom. Keeping it that way is a useful guard: if a change here
 * starts needing a browser environment, the library has grown a coupling it
 * should not have.
 */
export default defineConfig({
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
        restoreMocks: true,
        sequence: { shuffle: true },
        passWithNoTests: false,
    },
})
