import { describe, it, expect, vi, beforeEach } from 'vitest'
import { askChartConfig, inferConfig } from './askChartConfig'
import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import * as engineModule from './engine'
import * as devBusModule from '../devToolbar/devBus'
import type { DBRow } from './inferChartType'

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

const artistRows: DBRow[] = [
    { artist_name: 'Radiohead', count_streams: 120, ms_played: 3_600_000 },
    { artist_name: 'Björk', count_streams: 80, ms_played: 2_400_000 },
]

beforeEach(() => {
    vi.spyOn(engineModule, 'selectModelId').mockReturnValue('test-model')
    vi.spyOn(devBusModule.devBus, 'emit').mockImplementation(() => {})
})

describe('askChartConfig — ranked_list', () => {
    it('returns a ranked_list config with valid column keys', async () => {
        const engine = makeMockEngine(
            '{"type":"ranked_list","labelKey":"artist_name","valueKey":"count_streams","secondaryKey":"ms_played"}'
        )
        const config = await askChartConfig(engine, 'top artists?', artistRows)

        expect(config.type).toBe('ranked_list')
        if (config.type === 'ranked_list') {
            expect(config.labelKey).toBe('artist_name')
            expect(config.valueKey).toBe('count_streams')
            expect(config.secondaryKey).toBe('ms_played')
        }
    })

    it('drops secondaryKey when the column does not exist in rows', async () => {
        const engine = makeMockEngine(
            '{"type":"ranked_list","labelKey":"artist_name","valueKey":"count_streams","secondaryKey":"nonexistent"}'
        )
        const config = await askChartConfig(engine, 'top artists?', artistRows)

        expect(config.type).toBe('ranked_list')
        if (config.type === 'ranked_list')
            expect(config.secondaryKey).toBeUndefined()
    })
})

describe('askChartConfig — labeled_segments', () => {
    it('returns labeled_segments config with valid segment keys', async () => {
        const rows: DBRow[] = [
            {
                morning: 200,
                afternoon: 500,
                evening: 300,
                night: 100,
                total: 1100,
            },
        ]
        const engine = makeMockEngine(
            '{"type":"labeled_segments","segmentKeys":["morning","afternoon","evening","night"],"totalKey":"total"}'
        )
        const config = await askChartConfig(engine, 'listening rhythm?', rows)

        expect(config.type).toBe('labeled_segments')
        if (config.type === 'labeled_segments') {
            expect(config.segmentKeys).toEqual([
                'morning',
                'afternoon',
                'evening',
                'night',
            ])
            expect(config.totalKey).toBe('total')
        }
    })
})

describe('askChartConfig — skip_rate', () => {
    it('returns skip_rate config when the required columns are present', async () => {
        const rows: DBRow[] = [{ complete_listens: 800, skipped_listens: 200 }]
        const engine = makeMockEngine('{"type":"skip_rate"}')
        const config = await askChartConfig(engine, 'skip rate?', rows)

        expect(config.type).toBe('skip_rate')
    })

    it('falls back to inferConfig when skip_rate columns are missing', async () => {
        const engine = makeMockEngine('{"type":"skip_rate"}')
        const config = await askChartConfig(engine, 'skip rate?', artistRows)

        // artistRows has no complete_listens/skipped_listens → validation throws → fallback
        expect(['metric', 'bar', 'line', 'ranked_list', 'table']).toContain(
            config.type
        )
    })
})

describe('askChartConfig — calendar_heatmap', () => {
    it('returns calendar_heatmap config with dateKey and countKey', async () => {
        const rows: DBRow[] = [{ stream_date: '2025-01-01', stream_count: 5 }]
        const engine = makeMockEngine(
            '{"type":"calendar_heatmap","dateKey":"stream_date","countKey":"stream_count"}'
        )
        const config = await askChartConfig(engine, 'calendar?', rows)

        expect(config.type).toBe('calendar_heatmap')
        if (config.type === 'calendar_heatmap') {
            expect(config.dateKey).toBe('stream_date')
            expect(config.countKey).toBe('stream_count')
        }
    })
})

describe('askChartConfig — radial', () => {
    it('returns radial config with angleKey and countKey', async () => {
        const rows: DBRow[] = [
            { play_hour: 14, count_streams: 30, ms_played: 100_000 },
        ]
        const engine = makeMockEngine(
            '{"type":"radial","angleKey":"play_hour","countKey":"count_streams"}'
        )
        const config = await askChartConfig(engine, 'streams by hour?', rows)

        expect(config.type).toBe('radial')
        if (config.type === 'radial') {
            expect(config.angleKey).toBe('play_hour')
            expect(config.countKey).toBe('count_streams')
        }
    })
})

describe('askChartConfig — fallback behaviour', () => {
    it('falls back to inferConfig when the model emits invalid JSON', async () => {
        const engine = makeMockEngine('I cannot determine the chart type.')
        const config = await askChartConfig(engine, 'top artists?', artistRows)

        expect(config).toBeTruthy()
    })

    it('falls back to inferConfig when the model emits an unknown type', async () => {
        const engine = makeMockEngine(
            '{"type":"pie","x":"artist_name","y":"count_streams"}'
        )
        const config = await askChartConfig(engine, 'top artists?', artistRows)

        expect(['metric', 'bar', 'line', 'ranked_list', 'table']).toContain(
            config.type
        )
    })

    it('strips markdown fences before parsing', async () => {
        const engine = makeMockEngine(
            '```json\n{"type":"metric","key":"count_streams"}\n```'
        )
        const config = await askChartConfig(engine, 'total?', artistRows)

        expect(config.type).toBe('metric')
    })

    it('emits a webllm:inference devBus event on completion', async () => {
        const engine = makeMockEngine('{"type":"table"}')
        await askChartConfig(engine, 'raw data', artistRows)

        expect(devBusModule.devBus.emit).toHaveBeenCalledWith(
            'webllm:inference',
            expect.objectContaining({ model: 'test-model' })
        )
    })
})

describe('inferConfig fallback', () => {
    it('returns ranked_list for two-column string+number rows', () => {
        const rows: DBRow[] = [{ platform: 'Spotify', streams: 500 }]
        const config = inferConfig(rows)
        expect(config.type).toBe('ranked_list')
    })

    it('returns metric for a single numeric row', () => {
        const rows: DBRow[] = [{ total: 999 }]
        const config = inferConfig(rows)
        expect(config.type).toBe('metric')
        if (config.type === 'metric') expect(config.key).toBe('total')
    })

    it('returns table for empty rows', () => {
        const config = inferConfig([])
        expect(config.type).toBe('table')
    })
})
