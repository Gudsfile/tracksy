import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useChatSuggestions } from './useChatSuggestions'
import type { Suggestion } from '../llm/types'

const CHIPS: Suggestion[] = [{ label: 'Late night', question: 'After 1am?' }]

beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
    vi.useRealTimers()
})

/** Push past the hook's debounce window. */
async function settle() {
    await act(async () => {
        vi.advanceTimersByTime(600)
    })
}

type SuggestFn = (draft: string, signal?: AbortSignal) => Promise<Suggestion[]>

function setup(suggest: SuggestFn, draft = '') {
    return renderHook(
        (props: { draft: string; busy: boolean }) =>
            useChatSuggestions({
                draft: props.draft,
                enabled: true,
                busy: props.busy,
                suggest,
            }),
        { initialProps: { draft, busy: false } }
    )
}

describe('useChatSuggestions', () => {
    it('does not generate for a draft below the length threshold', async () => {
        const suggest = vi.fn().mockResolvedValue(CHIPS)
        const { result } = setup(suggest, 'top')
        await settle()

        expect(suggest).not.toHaveBeenCalled()
        expect(result.current.suggestions).toEqual([])
    })

    it('generates once after typing pauses, not per keystroke', async () => {
        const suggest = vi.fn().mockResolvedValue(CHIPS)
        const { rerender, result } = setup(suggest, '')

        for (const draft of [
            'what do i',
            'what do i listen',
            'what do i listen to late',
        ]) {
            rerender({ draft, busy: false })
            await act(async () => {
                vi.advanceTimersByTime(100)
            })
        }
        await settle()

        expect(suggest).toHaveBeenCalledTimes(1)
        expect(suggest).toHaveBeenCalledWith(
            'what do i listen to late',
            expect.any(AbortSignal)
        )
        await waitFor(() => expect(result.current.suggestions).toEqual(CHIPS))
    })

    it('does not generate while a real answer is loading', async () => {
        const suggest = vi.fn().mockResolvedValue(CHIPS)
        const { rerender } = setup(suggest, '')
        rerender({ draft: 'what do i listen to', busy: true })
        await settle()

        expect(suggest).not.toHaveBeenCalled()
    })

    it('aborts an in-flight generation when a real answer starts', async () => {
        let capturedSignal: AbortSignal | undefined
        const suggest = vi.fn((_draft: string, signal?: AbortSignal) => {
            capturedSignal = signal
            return new Promise<Suggestion[]>(() => {})
        })
        const { rerender } = setup(suggest, 'what do i listen to')
        await settle()
        expect(capturedSignal?.aborted).toBe(false)

        rerender({ draft: 'what do i listen to', busy: true })
        expect(capturedSignal?.aborted).toBe(true)
    })

    it('keeps the previous chips on screen while regenerating', async () => {
        const suggest = vi
            .fn()
            .mockResolvedValueOnce(CHIPS)
            .mockImplementationOnce(() => new Promise<Suggestion[]>(() => {}))
        const { rerender, result } = setup(suggest, 'what do i listen to')
        await settle()
        await waitFor(() => expect(result.current.suggestions).toEqual(CHIPS))

        rerender({ draft: 'what do i listen to on sundays', busy: false })
        await settle()

        expect(suggest).toHaveBeenCalledTimes(2)
        expect(result.current.suggestions).toEqual(CHIPS)
        expect(result.current.isGenerating).toBe(true)
    })

    it('keeps the previous chips when a generation returns nothing', async () => {
        const suggest = vi
            .fn()
            .mockResolvedValueOnce(CHIPS)
            .mockResolvedValueOnce([])
        const { rerender, result } = setup(suggest, 'what do i listen to')
        await settle()
        await waitFor(() => expect(result.current.suggestions).toEqual(CHIPS))

        rerender({ draft: 'what do i listen to on sundays', busy: false })
        await settle()

        expect(result.current.suggestions).toEqual(CHIPS)
    })

    it('falls back to nothing once the input is cleared', async () => {
        const suggest = vi.fn().mockResolvedValue(CHIPS)
        const { rerender, result } = setup(suggest, 'what do i listen to')
        await settle()
        await waitFor(() => expect(result.current.suggestions).toEqual(CHIPS))

        rerender({ draft: '', busy: false })
        await waitFor(() => expect(result.current.suggestions).toEqual([]))
        expect(result.current.isGenerating).toBe(false)
    })

    it('stops reporting generation when the draft shrinks mid-flight', async () => {
        // The cancelled run's `finally` is suppressed, so nothing else would
        // clear the flag — and the chip row would stay dimmed forever.
        const suggest = vi
            .fn()
            .mockImplementation(() => new Promise<Suggestion[]>(() => {}))
        const { rerender, result } = setup(suggest, 'what do i listen to')
        await settle()
        expect(result.current.isGenerating).toBe(true)

        rerender({ draft: 'top', busy: false })
        await settle()

        await waitFor(() => expect(result.current.isGenerating).toBe(false))
    })

    it('does not regenerate for an unchanged draft', async () => {
        const suggest = vi.fn().mockResolvedValue(CHIPS)
        const { rerender } = setup(suggest, 'what do i listen to')
        await settle()
        rerender({ draft: 'what do i listen to', busy: false })
        await settle()

        expect(suggest).toHaveBeenCalledTimes(1)
    })

    it('survives a rejected generation', async () => {
        const suggest = vi.fn().mockRejectedValue(new Error('nope'))
        const { result } = setup(suggest, 'what do i listen to')
        await settle()

        expect(result.current.suggestions).toEqual([])
        await waitFor(() => expect(result.current.isGenerating).toBe(false))
    })
})

describe('useChatSuggestions when disabled', () => {
    it('never calls the engine', async () => {
        const suggest = vi.fn().mockResolvedValue(CHIPS)
        renderHook(() =>
            useChatSuggestions({
                draft: 'what do i listen to',
                enabled: false,
                busy: false,
                suggest,
            })
        )
        await act(async () => {
            vi.advanceTimersByTime(600)
        })

        expect(suggest).not.toHaveBeenCalled()
    })
})
