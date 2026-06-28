import { describe, it, expect, vi, beforeEach } from 'vitest'
import { askChartConfig } from './askChartConfig'
import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import * as engineModule from './engine'
import * as devBusModule from '../devToolbar/devBus'

function makeMockEngine(content: string): MLCEngineInterface {
    return {
        chat: {
            completions: {
                create: vi.fn().mockResolvedValue({
                    choices: [{ message: { content } }],
                    usage: { completion_tokens: 10 },
                }),
            },
        },
    } as unknown as MLCEngineInterface
}

const rows = [
    { artist_name: 'Radiohead', count_streams: 120, ms_played: 3600000 },
    { artist_name: 'Björk', count_streams: 80, ms_played: 2400000 },
]

beforeEach(() => {
    vi.spyOn(engineModule, 'selectModelId').mockReturnValue('test-model')
    vi.spyOn(devBusModule.devBus, 'emit').mockImplementation(() => {})
})

describe('askChartConfig', () => {
    it('returns a valid ChartConfig when the model emits correct JSON', async () => {
        const engine = makeMockEngine(
            '{"type":"list","x":"artist_name","y":"count_streams"}'
        )
        const config = await askChartConfig(engine, 'top artists?', rows)

        expect(config.type).toBe('list')
        expect(config.x).toBe('artist_name')
        expect(config.y).toBe('count_streams')
    })

    it('strips markdown fences before parsing', async () => {
        const engine = makeMockEngine(
            '```json\n{"type":"bar","x":"artist_name","y":"ms_played"}\n```'
        )
        const config = await askChartConfig(engine, 'compare artists', rows)

        expect(config.type).toBe('bar')
    })

    it('falls back to inferChartType when the model emits invalid JSON', async () => {
        const engine = makeMockEngine('I cannot determine the chart type.')
        const config = await askChartConfig(engine, 'top artists?', rows)

        // inferChartType([{artist_name, count_streams, ms_played}]) → 'table' (3 columns)
        expect(['metric', 'bar', 'line', 'list', 'table']).toContain(
            config.type
        )
        expect(config.x).toBeUndefined()
        expect(config.y).toBeUndefined()
    })

    it('falls back to inferChartType when the model emits an unknown chart type', async () => {
        const engine = makeMockEngine(
            '{"type":"pie","x":"artist_name","y":"count_streams"}'
        )
        const config = await askChartConfig(engine, 'top artists?', rows)

        expect(['metric', 'bar', 'line', 'list', 'table']).toContain(
            config.type
        )
    })

    it('drops x/y when the column name does not exist in the rows', async () => {
        const engine = makeMockEngine(
            '{"type":"list","x":"nonexistent_col","y":"also_missing"}'
        )
        const config = await askChartConfig(engine, 'top artists?', rows)

        expect(config.type).toBe('list')
        expect(config.x).toBeUndefined()
        expect(config.y).toBeUndefined()
    })

    it('emits a webllm:inference devBus event on completion', async () => {
        const engine = makeMockEngine('{"type":"table"}')
        await askChartConfig(engine, 'raw data', rows)

        expect(devBusModule.devBus.emit).toHaveBeenCalledWith(
            'webllm:inference',
            expect.objectContaining({ model: 'test-model' })
        )
    })
})
