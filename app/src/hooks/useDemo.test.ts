import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDemo } from './useDemo'

afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
})

describe('useDemo', () => {
    it('should return initial values', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const { result } = renderHook(() => useDemo())
        const { isDemoReady, handleDemoButtonClick, demoJsonUrl } =
            result.current
        expect(warnSpy).toHaveBeenCalledWith(
            'Missing PUBLIC_DEMO_JSON_URL environment variable'
        )
        expect(isDemoReady).toBe(false)
        expect(handleDemoButtonClick).toBeDefined()
        expect(demoJsonUrl).toBeUndefined()
    })
    describe('when a bad JSONURL is valorized', () => {
        it('should return a warn', () => {
            vi.stubEnv('PUBLIC_DEMO_JSON_URL', 'bad-url')
            const warnSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {})
            const { result } = renderHook(() => useDemo())
            const { isDemoReady, handleDemoButtonClick, demoJsonUrl } =
                result.current
            expect(warnSpy).toHaveBeenCalledWith(
                'Invalid PUBLIC_DEMO_JSON_URL environment variable:',
                { url: 'bad-url' }
            )
            expect(isDemoReady).toBe(false)
            expect(handleDemoButtonClick).toBeDefined()
            expect(demoJsonUrl).toBeUndefined()
        })
    })
    describe('when a good JSONURL is valorized', () => {
        it('should return the good url', () => {
            vi.stubEnv('PUBLIC_DEMO_JSON_URL', 'https://example.com')
            const { result } = renderHook(() => useDemo())
            const { isDemoReady, handleDemoButtonClick, demoJsonUrl } =
                result.current
            expect(isDemoReady).toBe(false)
            expect(handleDemoButtonClick).toBeDefined()
            const expectedUrl = new URL('https://example.com')
            expect(demoJsonUrl).toStrictEqual(expectedUrl)
        })
    })
})
