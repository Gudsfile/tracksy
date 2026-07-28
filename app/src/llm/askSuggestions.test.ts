import { describe, it, expect, vi } from 'vitest'
import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import { askSuggestions, parseSuggestions } from './askSuggestions'

function fakeEngine(content: string) {
    const create = vi.fn().mockResolvedValue({
        choices: [{ message: { content } }],
        usage: { completion_tokens: 12 },
    })
    const interruptGenerate = vi.fn()
    return {
        engine: {
            chat: { completions: { create } },
            interruptGenerate,
        } as unknown as MLCEngineInterface,
        create,
        interruptGenerate,
    }
}

/** An engine whose generation never finishes on its own. */
function pendingEngine() {
    const create = vi.fn().mockImplementation(() => new Promise(() => {}))
    const interruptGenerate = vi.fn()
    return {
        engine: {
            chat: { completions: { create } },
            interruptGenerate,
        } as unknown as MLCEngineInterface,
        create,
        interruptGenerate,
    }
}

describe('parseSuggestions', () => {
    it('parses a well-formed array', () => {
        expect(
            parseSuggestions(
                '[{"label":"Top artists","question":"Who are my top artists?"}]'
            )
        ).toEqual([
            { label: 'Top artists', question: 'Who are my top artists?' },
        ])
    })

    it('tolerates code fences and trailing prose', () => {
        const raw =
            'Sure!\n```json\n[{"label":"A","question":"Q1?"}]\n```\nHope that helps.'
        expect(parseSuggestions(raw)).toEqual([{ label: 'A', question: 'Q1?' }])
    })

    it('returns an empty list for malformed JSON', () => {
        expect(parseSuggestions('[{"label": broken')).toEqual([])
        expect(parseSuggestions('no json at all')).toEqual([])
    })

    it('returns an empty list when the payload is not an array', () => {
        expect(parseSuggestions('{"label":"A","question":"Q?"}')).toEqual([])
    })

    it('drops entries with missing or non-string fields', () => {
        const raw = JSON.stringify([
            { label: 'Good', question: 'Real question?' },
            { label: 'No question' },
            { question: 'No label?' },
            { label: 42, question: 'Wrong type?' },
            null,
            'a string',
            { label: '   ', question: 'Blank label?' },
        ])
        expect(parseSuggestions(raw)).toEqual([
            { label: 'Good', question: 'Real question?' },
        ])
    })

    it('de-duplicates repeated questions', () => {
        const raw = JSON.stringify([
            { label: 'One', question: 'Same?' },
            { label: 'Two', question: 'Same?' },
        ])
        expect(parseSuggestions(raw)).toHaveLength(1)
    })

    it('caps the result at four chips', () => {
        const raw = JSON.stringify(
            Array.from({ length: 9 }, (_, i) => ({
                label: `L${i}`,
                question: `Q${i}?`,
            }))
        )
        expect(parseSuggestions(raw)).toHaveLength(4)
    })

    it('truncates over-long labels', () => {
        const raw = JSON.stringify([{ label: 'x'.repeat(80), question: 'Q?' }])
        expect(parseSuggestions(raw)[0].label.length).toBe(24)
    })
})

describe('askSuggestions', () => {
    it('returns parsed suggestions from the engine', async () => {
        const { engine } = fakeEngine('[{"label":"A","question":"Q?"}]')
        await expect(askSuggestions(engine, 'top art')).resolves.toEqual([
            { label: 'A', question: 'Q?' },
        ])
    })

    it('includes the draft and data context in the prompt', async () => {
        const { engine, create } = fakeEngine('[]')
        await askSuggestions(engine, 'late night', 'Top artists: Radiohead.')

        const { messages } = create.mock.calls[0][0]
        expect(messages[1].content).toContain('late night')
        expect(messages[1].content).toContain('Radiohead')
    })

    it('returns an empty list when the engine throws', async () => {
        const create = vi.fn().mockRejectedValue(new Error('GPU exploded'))
        const engine = {
            chat: { completions: { create } },
        } as unknown as MLCEngineInterface
        await expect(askSuggestions(engine, 'top art')).resolves.toEqual([])
    })

    it('returns an empty list when the response has no content', async () => {
        const create = vi.fn().mockResolvedValue({ choices: [] })
        const engine = {
            chat: { completions: { create } },
        } as unknown as MLCEngineInterface
        await expect(askSuggestions(engine, 'top art')).resolves.toEqual([])
    })

    it('resolves empty when the signal is already aborted', async () => {
        const { engine, create } = fakeEngine('[{"label":"A","question":"Q?"}]')
        const controller = new AbortController()
        controller.abort()
        await expect(
            askSuggestions(engine, 'top art', undefined, controller.signal)
        ).resolves.toEqual([])
        expect(create).not.toHaveBeenCalled()
    })

    it('resolves empty when aborted mid-flight', async () => {
        const { engine } = pendingEngine()
        const controller = new AbortController()
        const promise = askSuggestions(
            engine,
            'top art',
            undefined,
            controller.signal
        )
        controller.abort()
        await expect(promise).resolves.toEqual([])
    })

    it('interrupts generation on abort so the engine lock is released', async () => {
        // web-llm queues every request behind a per-model lock. Without the
        // interrupt, a user's question waits out the whole suggestion decode.
        const { engine, interruptGenerate } = pendingEngine()
        const controller = new AbortController()
        const promise = askSuggestions(
            engine,
            'top art',
            undefined,
            controller.signal
        )
        expect(interruptGenerate).not.toHaveBeenCalled()

        controller.abort()
        await promise
        expect(interruptGenerate).toHaveBeenCalledTimes(1)
    })
})
