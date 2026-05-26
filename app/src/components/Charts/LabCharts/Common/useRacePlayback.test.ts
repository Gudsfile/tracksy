import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useRacePlayback } from './useRacePlayback'

beforeEach(() => {
    vi.useFakeTimers()
    // The global setupFiles mock fires on observe(), but containerRef.current is null
    // in renderHook (no DOM rendered), so observe() is never called and isVisible stays
    // false. This override fires in the constructor instead so isVisible=true without DOM.
    vi.stubGlobal(
        'IntersectionObserver',
        class {
            constructor(private cb: IntersectionObserverCallback) {
                cb(
                    [{ isIntersecting: true } as IntersectionObserverEntry],
                    this as unknown as IntersectionObserver
                )
            }
            observe() {}
            unobserve() {}
            disconnect() {}
        }
    )
})

afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
})

const defaultOptions = { frameCount: 5, baseSpeed: 100, entityType: 'artists' }

describe('useRacePlayback', () => {
    it('returns initial state', () => {
        const { result } = renderHook(() => useRacePlayback(defaultOptions))

        expect(result.current.currentFrameIdx).toBe(0)
        expect(result.current.isPlaying).toBe(false)
        expect(result.current.speedMultiplier).toBe(1)
    })

    it('does not auto-play on initial render', () => {
        const { result } = renderHook(() => useRacePlayback(defaultOptions))

        expect(result.current.isPlaying).toBe(false)
    })

    describe('onFrameChange', () => {
        it('sets current frame index', () => {
            const { result } = renderHook(() => useRacePlayback(defaultOptions))

            act(() => result.current.onFrameChange(3))

            expect(result.current.currentFrameIdx).toBe(3)
        })

        it('stops playback', () => {
            const { result } = renderHook(() => useRacePlayback(defaultOptions))

            act(() => result.current.onPlayPause())
            act(() => result.current.onFrameChange(2))

            expect(result.current.isPlaying).toBe(false)
        })
    })

    describe('onSpeedChange', () => {
        it('updates speed multiplier', () => {
            const { result } = renderHook(() => useRacePlayback(defaultOptions))

            act(() => result.current.onSpeedChange(4))

            expect(result.current.speedMultiplier).toBe(4)
        })
    })

    describe('onPlayPause', () => {
        it('starts playback when paused at start', () => {
            const { result } = renderHook(() => useRacePlayback(defaultOptions))

            act(() => result.current.onPlayPause())

            expect(result.current.isPlaying).toBe(true)
        })

        it('pauses when playing', () => {
            const { result } = renderHook(() => useRacePlayback(defaultOptions))

            act(() => result.current.onPlayPause())
            act(() => result.current.onPlayPause())

            expect(result.current.isPlaying).toBe(false)
        })

        it('resets to frame 0 and plays when at last frame', () => {
            const { result } = renderHook(() => useRacePlayback(defaultOptions))

            act(() => result.current.onFrameChange(4))
            act(() => result.current.onPlayPause())

            expect(result.current.currentFrameIdx).toBe(0)
            expect(result.current.isPlaying).toBe(true)
        })
    })

    describe('playback', () => {
        it('advances frames on interval', () => {
            const { result } = renderHook(() => useRacePlayback(defaultOptions))

            act(() => result.current.onPlayPause())
            // baseSpeed=100ms, 2 intervals
            act(() => vi.advanceTimersByTime(250))

            expect(result.current.currentFrameIdx).toBe(2)
        })

        it('stops at last frame and sets isPlaying=false', () => {
            const { result } = renderHook(() => useRacePlayback(defaultOptions))

            act(() => result.current.onPlayPause())
            // frameCount=5, last index=4: needs 5 intervals (t=500 triggers stop)
            act(() => vi.advanceTimersByTime(600))

            expect(result.current.currentFrameIdx).toBe(4)
            expect(result.current.isPlaying).toBe(false)
        })

        it('speed multiplier reduces interval duration', () => {
            const { result } = renderHook(() => useRacePlayback(defaultOptions))

            act(() => result.current.onSpeedChange(2))
            act(() => result.current.onPlayPause())
            // At 2x: interval = 100/2 = 50ms. After 100ms: 2 frames advanced
            act(() => vi.advanceTimersByTime(100))

            expect(result.current.currentFrameIdx).toBe(2)
        })

        it('does not advance when frameCount is 0', () => {
            const { result } = renderHook(() =>
                useRacePlayback({ ...defaultOptions, frameCount: 0 })
            )

            act(() => result.current.onPlayPause())
            act(() => vi.advanceTimersByTime(500))

            expect(result.current.currentFrameIdx).toBe(0)
        })
    })

    describe('entityType change', () => {
        it('resets frame to 0 and starts playing', () => {
            const { result, rerender } = renderHook(
                ({ entityType }) =>
                    useRacePlayback({ ...defaultOptions, entityType }),
                { initialProps: { entityType: 'artists' } }
            )

            act(() => result.current.onFrameChange(3))
            rerender({ entityType: 'tracks' })

            expect(result.current.currentFrameIdx).toBe(0)
            expect(result.current.isPlaying).toBe(true)
        })

        it('does not reset on initial render', () => {
            const { result } = renderHook(() => useRacePlayback(defaultOptions))

            expect(result.current.currentFrameIdx).toBe(0)
            expect(result.current.isPlaying).toBe(false)
        })

        it('does not auto-reset on mount when entityType is omitted', () => {
            const { result } = renderHook(() =>
                useRacePlayback({ frameCount: 5, baseSpeed: 100 })
            )

            expect(result.current.currentFrameIdx).toBe(0)
            expect(result.current.isPlaying).toBe(false)
        })
    })
})
