import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDemo } from './useDemo'
import * as insertUrlModule from '../db/queries/insertUrlInDatabase'

afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
})

describe('useDemo', () => {
    it('should return initial values', () => {
        vi.stubEnv('PUBLIC_DEMO_JSON_URL', undefined)
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

    describe('when an incorrectly formatted URL is passed', () => {
        it('should log a warning', () => {
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

    describe('when a correctly formatted URL is passed', () => {
        it('should define the URL', () => {
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

    describe('demoProgress', () => {
        it('starts as null', () => {
            vi.stubEnv('PUBLIC_DEMO_JSON_URL', 'https://example.com')
            const { result } = renderHook(() => useDemo())
            expect(result.current.demoProgress).toBeNull()
        })

        it('is null after a failed load', async () => {
            vi.stubEnv('PUBLIC_DEMO_JSON_URL', 'https://example.com')
            vi.spyOn(insertUrlModule, 'insertUrlInDatabase').mockRejectedValue(
                new Error('fail')
            )

            const { result } = renderHook(() => useDemo())
            await act(async () => {
                await result.current.handleDemoButtonClick()
            })

            expect(result.current.demoProgress).toBeNull()
            expect(result.current.isDemoReady).toBe(false)
        })

        it('is null after a successful load', async () => {
            vi.stubEnv('PUBLIC_DEMO_JSON_URL', 'https://example.com')
            vi.spyOn(insertUrlModule, 'insertUrlInDatabase').mockResolvedValue(
                undefined
            )

            const { result } = renderHook(() => useDemo())
            await act(async () => {
                await result.current.handleDemoButtonClick()
            })

            expect(result.current.demoProgress).toBeNull()
            expect(result.current.isDemoReady).toBe(true)
        })
    })
})
