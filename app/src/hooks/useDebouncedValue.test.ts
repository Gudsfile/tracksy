import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebouncedValue(42, 250))
        expect(result.current).toBe(42)
    })

    it('should not update before delay elapses', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 250),
            { initialProps: { value: 1 } }
        )

        rerender({ value: 2 })
        act(() => {
            vi.advanceTimersByTime(100)
        })

        expect(result.current).toBe(1)
    })

    it('should update after delay elapses', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 250),
            { initialProps: { value: 1 } }
        )

        rerender({ value: 2 })
        act(() => {
            vi.advanceTimersByTime(250)
        })

        expect(result.current).toBe(2)
    })

    it('should only emit the last value when updated rapidly', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 250),
            { initialProps: { value: 1 } }
        )

        rerender({ value: 2 })
        act(() => {
            vi.advanceTimersByTime(100)
        })
        rerender({ value: 3 })
        act(() => {
            vi.advanceTimersByTime(100)
        })
        rerender({ value: 4 })
        act(() => {
            vi.advanceTimersByTime(250)
        })

        expect(result.current).toBe(4)
    })
})
