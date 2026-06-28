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

        await askNarrator(engine, 'Who are my top artists?', [], (d) =>
            chunks.push(d)
        )

        expect(chunks).toEqual(['Hello', ' world', '!'])
    })

    it('returns the full concatenated narrative', async () => {
        const engine = makeMockEngine(['Your ', 'top artist ', 'is Drake.'])

        const result = await askNarrator(
            engine,
            'Who are my top artists?',
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

        await askNarrator(engine, 'question', rows, () => {})

        const createCall = (
            engine.chat.completions.create as ReturnType<typeof vi.fn>
        ).mock.calls[0][0]
        const userContent = createCall.messages[1].content as string
        // Table has header + separator + N data rows; count data rows only
        const tableLines = userContent
            .split('\n')
            .filter((l) => l.startsWith('|') && !l.includes('---'))
        // subtract 1 for the header row
        expect(tableLines.length - 1).toBe(10)
    })

    it('emits a webllm:inference devBus event on completion', async () => {
        const engine = makeMockEngine(['done'])

        await askNarrator(engine, 'q', [], () => {})

        expect(devBusModule.devBus.emit).toHaveBeenCalledWith(
            'webllm:inference',
            expect.objectContaining({ model: 'test-model' })
        )
    })

    it('converts ms_played to hours_played before passing data to the model', async () => {
        const engine = makeMockEngine(['ok'])
        const rows = [
            {
                artist_name: 'Thomas Maddox',
                count_streams: 18,
                ms_played: 3_275_010,
            },
            {
                artist_name: 'Paul Patterson',
                count_streams: 17,
                ms_played: 3_749_911,
            },
        ]

        await askNarrator(engine, 'top artists in spring', rows, () => {})

        const createCall = (
            engine.chat.completions.create as ReturnType<typeof vi.fn>
        ).mock.calls[0][0]
        const userContent = createCall.messages[1].content as string
        // Raw ms values must not appear; hours_played column must be present
        expect(userContent).not.toContain('ms_played')
        expect(userContent).toContain('hours_played')
        // Thomas Maddox: 3275010 / 3600000 = 0.91
        expect(userContent).toContain('0.91')
    })

    it('uses explanation as context when no rows are provided', async () => {
        const engine = makeMockEngine(['ok'])

        await askNarrator(
            engine,
            'question',
            [],
            () => {},
            'Bar chart of top artists'
        )

        const createCall = (
            engine.chat.completions.create as ReturnType<typeof vi.fn>
        ).mock.calls[0][0]
        const userContent = createCall.messages[1].content as string
        expect(userContent).toContain(
            'Chart description: Bar chart of top artists'
        )
    })
})
