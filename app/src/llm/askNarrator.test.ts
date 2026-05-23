import { describe, it, expect, vi, beforeEach } from 'vitest'
import { askNarrator } from './askNarrator'
import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import * as engineModule from './engine'
import * as devBusModule from '../devToolbar/devBus'

function makeChunk(content: string) {
    return {
        choices: [{ delta: { content }, finish_reason: null }],
        usage: null,
    }
}

function makeMockEngine(deltas: string[]): MLCEngineInterface {
    async function* stream() {
        for (const d of deltas) yield makeChunk(d)
    }
    return {
        chat: {
            completions: {
                create: vi.fn().mockResolvedValue(stream()),
            },
        },
    } as unknown as MLCEngineInterface
}

beforeEach(() => {
    vi.spyOn(engineModule, 'selectModelId').mockReturnValue('test-model')
    vi.spyOn(devBusModule.devBus, 'emit').mockImplementation(() => {})
})

describe('askNarrator', () => {
    it('calls onChunk for every streaming delta', async () => {
        const engine = makeMockEngine(['Hello', ' world', '!'])
        const chunks: string[] = []

        await askNarrator(
            engine,
            'Who are my top artists?',
            'SELECT 1',
            [],
            (d) => chunks.push(d)
        )

        expect(chunks).toEqual(['Hello', ' world', '!'])
    })

    it('returns the full concatenated narrative', async () => {
        const engine = makeMockEngine(['Your ', 'top artist ', 'is Drake.'])

        const result = await askNarrator(
            engine,
            'Who are my top artists?',
            'SELECT 1',
            [],
            () => {}
        )

        expect(result).toBe('Your top artist is Drake.')
    })

    it('passes only the first 10 rows to the model', async () => {
        const engine = makeMockEngine(['ok'])
        const rows = Array.from({ length: 15 }, (_, i) => ({
            artist: `Artist${i}`,
        }))

        await askNarrator(engine, 'question', 'SELECT 1', rows, () => {})

        const createCall = (
            engine.chat.completions.create as ReturnType<typeof vi.fn>
        ).mock.calls[0][0]
        const userContent = createCall.messages[1].content as string
        const parsed = JSON.parse(userContent.split(':\n')[2])
        expect(parsed).toHaveLength(10)
    })

    it('emits a webllm:inference devBus event on completion', async () => {
        const engine = makeMockEngine(['done'])

        await askNarrator(engine, 'q', 'SELECT 1', [], () => {})

        expect(devBusModule.devBus.emit).toHaveBeenCalledWith(
            'webllm:inference',
            expect.objectContaining({ model: 'test-model' })
        )
    })
})
