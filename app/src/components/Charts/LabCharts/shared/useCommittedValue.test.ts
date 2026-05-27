import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCommittedValue } from './useCommittedValue'

describe('useCommittedValue', () => {
    it('returns initial value on mount', () => {
        const { result } = renderHook(() =>
            useCommittedValue(undefined, 'artists')
        )
        expect(result.current).toBe('artists')
    })

    it('commits new value when data reference changes', () => {
        const data1 = [1]
        const { result, rerender } = renderHook(
            ({ data, value }: { data: number[] | undefined; value: string }) =>
                useCommittedValue(data, value),
            {
                initialProps: {
                    data: undefined as number[] | undefined,
                    value: 'artists',
                },
            }
        )

        act(() => {
            rerender({ data: data1, value: 'tracks' })
        })

        expect(result.current).toBe('tracks')
    })

    it('holds committed value when data reference is unchanged', () => {
        const data1 = [1]
        const { result, rerender } = renderHook(
            ({ data, value }: { data: number[] | undefined; value: string }) =>
                useCommittedValue(data, value),
            {
                initialProps: {
                    data: undefined as number[] | undefined,
                    value: 'artists',
                },
            }
        )

        act(() => {
            rerender({ data: data1, value: 'tracks' })
        })
        expect(result.current).toBe('tracks')

        act(() => {
            rerender({ data: data1, value: 'albums' })
        })
        expect(result.current).toBe('tracks')
    })
})
