import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import { runAssistantTurn } from './runAssistantTurn'
import * as askLLMModule from './askLLM'
import * as askChartConfigModule from './askChartConfig'
import * as askNarratorModule from './askNarrator'
import * as queryDBModule from '../db/queries/queryDB'
import { configFromPreset, type AssistantConfig } from './assistantConfig'
import { makeChatAnswer } from './testHelpers'
import { TRACKSY_ATTR, type TurnTracer } from './tracingTypes'
import { LLMError } from './types'

const engine = {} as MLCEngineInterface

const ROWS = [{ artist_name: 'Boards of Canada', c: 42 }]

function config(overrides: Partial<AssistantConfig> = {}): AssistantConfig {
    return { ...configFromPreset('rich'), ...overrides }
}

function run(
    cfg: AssistantConfig = config(),
    userText = 'top artists',
    signal?: AbortSignal
) {
    return runAssistantTurn(engine, cfg, userText, [], signal)
}

beforeEach(() => {
    vi.restoreAllMocks()
})

describe('runAssistantTurn — happy path', () => {
    it('returns the answer and rows from a single execution', async () => {
        const answer = makeChatAnswer('top_artists')
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(answer)
        const query = vi
            .spyOn(queryDBModule, 'queryDBAsJSON')
            .mockResolvedValue(ROWS)
        vi.spyOn(askChartConfigModule, 'askChartConfig').mockResolvedValue({
            type: 'ranked_list',
            labelKey: 'artist_name',
            valueKey: 'c',
        })

        const result = await run()

        expect(result.payload.kind).toBe('ok')
        expect(result.rows).toEqual(ROWS)
        // The chart, the narrative and the displayed SQL must all read from one
        // result set, so the SQL is executed exactly once.
        expect(query).toHaveBeenCalledTimes(1)
    })

    it('carries the validated SQL rather than the raw model output', async () => {
        // sqlSafety normalises what it accepts; the payload must show what
        // actually ran, not what the model proposed.
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(
            makeChatAnswer('top_artists', {
                sql: '  SELECT artist_name FROM music_streams;  ',
            })
        )
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue(ROWS)

        const result = await run(config({ chart: 'infer' }))

        expect(result.payload.kind).toBe('ok')
        if (result.payload.kind !== 'ok') return
        expect(result.payload.answer.sql).not.toMatch(/^\s/)
    })
})

describe('runAssistantTurn — SQL guardrail', () => {
    it('reports unsafe SQL without executing it', async () => {
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(
            makeChatAnswer('custom', {
                sql: 'DROP TABLE music_streams',
            })
        )
        const query = vi.spyOn(queryDBModule, 'queryDBAsJSON')

        const result = await run()

        expect(result.payload.kind).toBe('unsafe-sql')
        if (result.payload.kind !== 'unsafe-sql') return
        expect(result.payload.reason).toBeTruthy()
        expect(query).not.toHaveBeenCalled()
    })
})

describe('runAssistantTurn — retry', () => {
    it('feeds the failure back to the model and executes the correction', async () => {
        const askLLM = vi
            .spyOn(askLLMModule, 'askLLM')
            .mockResolvedValueOnce(
                makeChatAnswer('custom', {
                    sql: 'SELECT nope FROM music_streams',
                })
            )
            .mockResolvedValueOnce(
                makeChatAnswer('custom', {
                    sql: 'SELECT artist_name FROM music_streams',
                })
            )
        vi.spyOn(queryDBModule, 'queryDBAsJSON')
            .mockRejectedValueOnce(
                new Error('Referenced column "nope" not found')
            )
            .mockResolvedValueOnce(ROWS)

        const result = await run(config({ chart: 'infer' }))

        expect(result.payload.kind).toBe('ok')
        expect(result.rows).toEqual(ROWS)
        expect(askLLM).toHaveBeenCalledTimes(2)
        // The retry prompt must actually contain the error, or the model has
        // nothing to correct against.
        expect(askLLM.mock.calls[1]?.[1]).toContain('nope')
    })

    it('reports sql-error when the retry also fails', async () => {
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(
            makeChatAnswer('custom', {
                sql: 'SELECT nope FROM music_streams',
            })
        )
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockRejectedValue(
            new Error('still broken')
        )

        const result = await run()

        expect(result.payload.kind).toBe('sql-error')
        if (result.payload.kind !== 'sql-error') return
        expect(result.payload.error).toBe('still broken')
    })

    it('reports unsafe-sql when the retry produces dangerous SQL', async () => {
        vi.spyOn(askLLMModule, 'askLLM')
            .mockResolvedValueOnce(
                makeChatAnswer('custom', {
                    sql: 'SELECT nope FROM music_streams',
                })
            )
            .mockResolvedValueOnce(
                makeChatAnswer('custom', { sql: 'DELETE FROM music_streams' })
            )
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockRejectedValueOnce(
            new Error('bad column')
        )

        const result = await run()

        expect(result.payload.kind).toBe('unsafe-sql')
    })

    it('does not retry when the failure is the guardrail rather than the query', async () => {
        const askLLM = vi
            .spyOn(askLLMModule, 'askLLM')
            .mockResolvedValue(
                makeChatAnswer('custom', { sql: 'DROP TABLE music_streams' })
            )

        await run()

        expect(askLLM).toHaveBeenCalledTimes(1)
    })
})

describe('runAssistantTurn — chart modes', () => {
    beforeEach(() => {
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(
            makeChatAnswer('top_artists')
        )
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue(ROWS)
    })

    it('asks the chart agent when chart is "llm"', async () => {
        const askChartConfig = vi
            .spyOn(askChartConfigModule, 'askChartConfig')
            .mockResolvedValue({ type: 'bar', x: 'artist_name', y: 'c' })

        const result = await run(config({ chart: 'llm' }))

        expect(askChartConfig).toHaveBeenCalledTimes(1)
        expect(result.chartConfig).toEqual({
            type: 'bar',
            x: 'artist_name',
            y: 'c',
        })
    })

    it('falls back silently when the chart agent fails', async () => {
        vi.spyOn(askChartConfigModule, 'askChartConfig').mockRejectedValue(
            new Error('unparseable chart config')
        )

        const result = await run(config({ chart: 'llm' }))

        // The turn still succeeds; the renderer applies its own heuristic.
        expect(result.payload.kind).toBe('ok')
        expect(result.chartConfig).toBeUndefined()
    })

    it('renders a plain table when chart is "off"', async () => {
        const askChartConfig = vi.spyOn(askChartConfigModule, 'askChartConfig')

        const result = await run(config({ chart: 'off' }))

        expect(result.chartConfig).toEqual({ type: 'table' })
        expect(askChartConfig).not.toHaveBeenCalled()
    })

    it('leaves the config undefined when chart is "infer"', async () => {
        const askChartConfig = vi.spyOn(askChartConfigModule, 'askChartConfig')

        const result = await run(config({ chart: 'infer' }))

        expect(result.chartConfig).toBeUndefined()
        expect(askChartConfig).not.toHaveBeenCalled()
    })

    it('skips chart and narrative entirely for an empty result set', async () => {
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue([])
        const askChartConfig = vi.spyOn(askChartConfigModule, 'askChartConfig')

        const result = await run(config({ chart: 'off', narrative: 'stream' }))

        expect(result.payload.kind).toBe('ok')
        expect(result.rows).toEqual([])
        expect(result.chartConfig).toBeUndefined()
        expect(result.streamNarrator).toBeUndefined()
        expect(askChartConfig).not.toHaveBeenCalled()
    })
})

describe('runAssistantTurn — narrative modes', () => {
    beforeEach(() => {
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(
            makeChatAnswer('top_artists')
        )
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue(ROWS)
        vi.spyOn(askChartConfigModule, 'askChartConfig').mockResolvedValue({
            type: 'table',
        })
    })

    it('attaches a deferred narrator when narrative is "stream"', async () => {
        const askNarrator = vi
            .spyOn(askNarratorModule, 'askNarrator')
            .mockResolvedValue('You lean heavily on one artist.')

        const result = await run(config({ narrative: 'stream' }))

        // Deferred, not invoked: the UI calls it once the chart has rendered.
        expect(result.streamNarrator).toBeTypeOf('function')
        expect(askNarrator).not.toHaveBeenCalled()

        const onChunk = vi.fn()
        await expect(result.streamNarrator?.(onChunk)).resolves.toBe(
            'You lean heavily on one artist.'
        )
        expect(askNarrator).toHaveBeenCalledTimes(1)
        // The narrator summarises the same rows that were executed once above.
        expect(askNarrator.mock.calls[0]?.[2]).toEqual(ROWS)
    })

    it('attaches no narrator when narrative is "static"', async () => {
        const result = await run(config({ narrative: 'static' }))

        expect(result.streamNarrator).toBeUndefined()
    })
})

describe('runAssistantTurn — failures', () => {
    it('maps an aborted turn to the aborted payload', async () => {
        vi.spyOn(askLLMModule, 'askLLM').mockRejectedValue(
            new LLMError('Cancelled', 'aborted')
        )

        expect((await run()).payload.kind).toBe('aborted')
    })

    it('forwards the abort signal to the model call', async () => {
        const askLLM = vi
            .spyOn(askLLMModule, 'askLLM')
            .mockResolvedValue(makeChatAnswer('top_artists'))
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue([])
        const controller = new AbortController()

        await run(config({ chart: 'infer' }), 'top artists', controller.signal)

        expect(askLLM.mock.calls[0]?.[3]).toBe(controller.signal)
    })

    it('reports a parse failure as llm-error', async () => {
        vi.spyOn(askLLMModule, 'askLLM').mockRejectedValue(
            new LLMError('Model output is not valid JSON.', 'parse')
        )

        const result = await run()

        expect(result.payload.kind).toBe('llm-error')
        if (result.payload.kind !== 'llm-error') return
        expect(result.payload.error).toBe('Model output is not valid JSON.')
    })

    it('stringifies a non-Error rejection rather than losing it', async () => {
        vi.spyOn(askLLMModule, 'askLLM').mockRejectedValue('device lost')

        const result = await run()

        expect(result.payload.kind).toBe('llm-error')
        if (result.payload.kind !== 'llm-error') return
        expect(result.payload.error).toBe('device lost')
    })
})

type RecordedSpan = {
    kind: string
    name: string
    attributes: Record<string, unknown>
    status?: string
    error?: { kind?: string; message: string }
}

/**
 * A `TurnTracer` that records instead of tracing. The pipeline is written
 * against the interface, not the library, which is what makes this possible
 * without pulling `webllm-otel` into the test.
 */
function recordingTracer() {
    const spans: RecordedSpan[] = []
    const wrapped: string[] = []
    const tracer: TurnTracer = {
        span(kind, name, attributes) {
            const recorded: RecordedSpan = {
                kind,
                name,
                attributes: { ...attributes },
            }
            spans.push(recorded)
            return {
                setAttributes(more) {
                    Object.assign(recorded.attributes, more)
                },
                end(options) {
                    recorded.status =
                        options?.status ?? (options?.error ? 'error' : 'ok')
                    if (options?.error) recorded.error = options.error
                    Object.assign(recorded.attributes, options?.attributes)
                },
            }
        },
        wrapEngine(engineToWrap, kind) {
            wrapped.push(kind)
            return engineToWrap
        },
        end() {},
        spans: () => [],
    }
    const byKind = (kind: string) => spans.filter((s) => s.kind === kind)
    return { tracer, spans, wrapped, byKind }
}

describe('runAssistantTurn — instrumentation', () => {
    it('costs nothing when no tracer is supplied', async () => {
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(
            makeChatAnswer('top_artists')
        )
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue(ROWS)

        // Production passes no tracer; every `tracer?.…` short-circuits before
        // its arguments are even constructed.
        await expect(
            runAssistantTurn(engine, config({ chart: 'infer' }), 'q', [])
        ).resolves.toMatchObject({ payload: { kind: 'ok' } })
    })

    it('spans the router, guardrail and query on the happy path', async () => {
        const { tracer, byKind } = recordingTracer()
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(
            makeChatAnswer('top_artists')
        )
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue(ROWS)

        await runAssistantTurn(
            engine,
            config({ chart: 'infer' }),
            'q',
            [],
            undefined,
            tracer
        )

        expect(byKind('router')[0]?.attributes[TRACKSY_ATTR.INTENT]).toBe(
            'top_artists'
        )
        expect(byKind('sql-validate')[0]?.status).toBe('ok')
        expect(byKind('duckdb')[0]?.status).toBe('ok')
        expect(byKind('duckdb')[0]?.attributes[TRACKSY_ATTR.ROW_COUNT]).toBe(1)
        expect(byKind('retry')).toHaveLength(0)
    })

    it('records the guardrail rejection reason', async () => {
        const { tracer, byKind } = recordingTracer()
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(
            makeChatAnswer('custom', { sql: 'DROP TABLE music_streams' })
        )

        await runAssistantTurn(engine, config(), 'q', [], undefined, tracer)

        const span = byKind('sql-validate')[0]
        expect(span?.status).toBe('error')
        expect(span?.error?.kind).toBe('unsafe-sql')
        expect(span?.attributes[TRACKSY_ATTR.SQL_REJECTION]).toBeTruthy()
        // The query never ran, so there is nothing to span.
        expect(byKind('duckdb')).toHaveLength(0)
    })

    it('spans the failed query and the retry that corrects it', async () => {
        const { tracer, byKind } = recordingTracer()
        vi.spyOn(askLLMModule, 'askLLM')
            .mockResolvedValueOnce(
                makeChatAnswer('custom', {
                    sql: 'SELECT nope FROM music_streams',
                })
            )
            .mockResolvedValueOnce(
                makeChatAnswer('custom', {
                    sql: 'SELECT artist_name FROM music_streams',
                })
            )
        vi.spyOn(queryDBModule, 'queryDBAsJSON')
            .mockRejectedValueOnce(new Error('no such column'))
            .mockResolvedValueOnce(ROWS)

        await runAssistantTurn(
            engine,
            config({ chart: 'infer' }),
            'q',
            [],
            undefined,
            tracer
        )

        expect(byKind('duckdb')[0]?.status).toBe('error')
        expect(byKind('duckdb')[0]?.error?.message).toBe('no such column')
        expect(byKind('retry')[0]?.status).toBe('ok')
        expect(byKind('retry')[0]?.attributes[TRACKSY_ATTR.ROW_COUNT]).toBe(1)
    })

    it('records the retry failing', async () => {
        const { tracer, byKind } = recordingTracer()
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(
            makeChatAnswer('custom', { sql: 'SELECT nope FROM music_streams' })
        )
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockRejectedValue(
            new Error('still broken')
        )

        await runAssistantTurn(engine, config(), 'q', [], undefined, tracer)

        expect(byKind('retry')[0]?.status).toBe('error')
        expect(byKind('retry')[0]?.error?.message).toBe('still broken')
    })

    it('surfaces the silent chart fallback that a bare catch would hide', async () => {
        const { tracer, byKind } = recordingTracer()
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(
            makeChatAnswer('top_artists')
        )
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue(ROWS)
        vi.spyOn(askChartConfigModule, 'askChartConfig').mockRejectedValue(
            new Error('unparseable chart config')
        )

        await runAssistantTurn(
            engine,
            config({ chart: 'llm' }),
            'q',
            [],
            undefined,
            tracer
        )

        // The turn still succeeds and the renderer substitutes its heuristic —
        // which is exactly why this degradation needs a span to be visible.
        const fallback = byKind('chart-fallback')[0]
        expect(fallback?.status).toBe('skipped')
        expect(fallback?.error?.message).toBe('unparseable chart config')
    })

    it('attributes each engine call to the agent that made it', async () => {
        const { tracer, wrapped } = recordingTracer()
        vi.spyOn(askLLMModule, 'askLLM').mockResolvedValue(
            makeChatAnswer('top_artists')
        )
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue(ROWS)
        vi.spyOn(askChartConfigModule, 'askChartConfig').mockResolvedValue({
            type: 'table',
        })
        vi.spyOn(askNarratorModule, 'askNarrator').mockResolvedValue('summary')

        const result = await runAssistantTurn(
            engine,
            config({ chart: 'llm', narrative: 'stream' }),
            'q',
            [],
            undefined,
            tracer
        )
        await result.streamNarrator?.(() => {})

        // The narrator is wrapped when its deferred callback runs, not before —
        // ambient context would have been long gone by then.
        expect(wrapped).toEqual(['router', 'chart', 'narrator'])
    })
})
