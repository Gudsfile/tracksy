import { it, expect, vi } from 'vitest'
import { getTestPath } from './getTestPath'

it('should return default test path', () => {
    expect(getTestPath()).toBe('/tracksy')
})

it('should return test path from env', () => {
    vi.stubEnv('TEST_PATH', '/toto')
    expect(getTestPath()).toBe('/toto')
})
