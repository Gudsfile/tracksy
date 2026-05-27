import { renderHook, act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useGranularity } from './useGranularity'

describe('useGranularity', () => {
    it('year=undefined yields availableGranularities=[year, month]', () => {
        const { result } = renderHook(() => useGranularity(undefined))
        expect(result.current.availableGranularities).toEqual(['year', 'month'])
    })

    it('year=2023 yields availableGranularities=[month, week, day]', () => {
        const { result } = renderHook(() => useGranularity(2023))
        expect(result.current.availableGranularities).toEqual([
            'month',
            'week',
            'day',
        ])
    })

    it('effectiveGranularity falls back to availableGranularities[0] when current unavailable', () => {
        const { result, rerender } = renderHook(
            ({ year }: { year: number | undefined }) => useGranularity(year),
            { initialProps: { year: 2023 as number | undefined } }
        )
        act(() => result.current.setGranularity('day'))
        expect(result.current.effectiveGranularity).toBe('day')

        rerender({ year: undefined })
        expect(result.current.effectiveGranularity).toBe('year')
    })

    it('effectiveGranularity preserves granularity when available', () => {
        const { result } = renderHook(() => useGranularity(2023))
        act(() => result.current.setGranularity('week'))
        expect(result.current.effectiveGranularity).toBe('week')
    })
})
