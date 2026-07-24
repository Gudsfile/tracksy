import { describe, it, expect, vi, afterEach } from 'vitest'
import { resolveCallerSource } from './resolveCallerSource'

describe('resolveCallerSource', () => {
    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it('returns undefined in production build', () => {
        vi.stubEnv('DEV', false)
        expect(resolveCallerSource()).toBeUndefined()
    })

    it('returns undefined in DEV when no components/ frame in stack', () => {
        vi.stubEnv('DEV', true)
        // Called from a test frame, not a components/ path.
        expect(resolveCallerSource()).toBeUndefined()
    })
})
