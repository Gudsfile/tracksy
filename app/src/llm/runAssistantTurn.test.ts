import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import { runAssistantTurn } from './runAssistantTurn'
import * as askLLMModule from './askLLM'
import * as askChartConfigModule from './askChartConfig'
import * as askNarratorModule from './askNarrator'
import * as queryDBModule from '../db/queries/queryDB'
import { configFromPreset, type AssistantConfig } from './assistantConfig'
import { makeChatAnswer } from './testHelpers'
import type { Span } from 'webllm-otel'
import { createTurnTracer } from './tracing'
import { TRACKSY_ATTR } from './tracingTypes'
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

/**
 * A stand-in for the WebLLM engine that answers each completion in turn. Using
 * a fake *engine* with the real `askLLM`, `askChartConfig` and tracer — rather
 * than mocking the functions under observation — is what lets these tests see
 * failures that are decided inside those functions (a parse error, a chart
 * fallback) the way production does.
 */
function fakeEngine(...answers: (string | Error | Promise<never>)[]) {
    const queue = [...answers]
    const create = vi.fn(async () => {
        const next = queue.shift()
        if (next instanceof Error) throw next
        if (next instanceof Promise) return next
        return {
            id: 'chatcmpl-test',
            choices: [{ message: { content: next ?? '' } }],
            usage: { prompt_tokens: 10, completion_tokens: 5 },
        }
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

const ROUTER_JSON = JSON.stringify(makeChatAnswer('top_artists'))

/** A real traced turn, read back as a tree. */
function tracedTurn(question = 'top artists') {
    const tracer = createTurnTracer({
        question,
        modelId: 'test-model',
        sessionId: 'session-1',
    })
    const tree = () => {
        const spans = tracer.spans()
        const root = spans.find((s) => s.parentSpanId === undefined)
        const childrenOf = (span: Span | undefined) =>
            spans.filter((s) => span && s.parentSpanId === span.spanId)
        const byKind = (kind: string) => spans.filter((s) => s.kind === kind)
        const generationsUnder = (span: Span | undefined) =>
            childrenOf(span).filter((s) => s.name.startsWith('chat'))
        return { spans, root, childrenOf, byKind, generationsUnder }
    }
    return { tracer, tree }
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

    it('nests each model call under the step that made it', async () => {
        const { engine: fake } = fakeEngine(ROUTER_JSON)
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue(ROWS)
        const { tracer, tree } = tracedTurn()

        await runAssistantTurn(
            fake,
            config({ chart: 'infer', narrative: 'static' }),
            'q',
            [],
            undefined,
            tracer
        )

        const { root, childrenOf, byKind, generationsUnder } = tree()
        const router = byKind('router').find((s) => s.name === 'router')
        expect(childrenOf(root).map((s) => s.kind)).toEqual([
            'router',
            'sql-validate',
            'duckdb',
        ])
        expect(generationsUnder(router)).toHaveLength(1)
        expect(generationsUnder(router)[0]?.name).toBe('chat test-model')
        expect(root?.attributes[TRACKSY_ATTR.INTENT]).toBe('top_artists')
        expect(root?.status).toBe('ok')
        expect(root?.attributes[TRACKSY_ATTR.PAYLOAD_KIND]).toBe('ok')
        expect(root?.attributes['session.id']).toBe('session-1')
        expect(root?.attributes[TRACKSY_ATTR.ERROR_TYPE]).toBeUndefined()
    })

    it('records a router parse failure on the router step and the turn', async () => {
        // The model call succeeded; its output did not parse. Only the step
        // that parses it can say so.
        const { engine: fake } = fakeEngine('this is not json')
        const { tracer, tree } = tracedTurn()

        await runAssistantTurn(fake, config(), 'q', [], undefined, tracer)

        const { root, byKind, generationsUnder } = tree()
        const router = byKind('router').find((s) => s.name === 'router')
        expect(generationsUnder(router)[0]?.status).toBe('ok')
        expect(router?.status).toBe('error')
        expect(router?.error?.kind).toBe('parse')
        expect(root?.status).toBe('error')
        expect(root?.error).toEqual({
            kind: 'llm-error',
            message: 'No JSON object found in model output.',
        })
        // The cause, as a class, for dashboards to group failures by.
        expect(root?.attributes[TRACKSY_ATTR.ERROR_TYPE]).toBe('parse')
    })

    it('records the guardrail rejection reason', async () => {
        const { engine: fake } = fakeEngine(
            JSON.stringify(
                makeChatAnswer('custom', { sql: 'DROP TABLE music_streams' })
            )
        )
        const query = vi.spyOn(queryDBModule, 'queryDBAsJSON')
        const { tracer, tree } = tracedTurn()

        await runAssistantTurn(fake, config(), 'q', [], undefined, tracer)

        const span = tree().byKind('sql-validate')[0]
        expect(span?.status).toBe('error')
        expect(span?.error?.kind).toBe('unsafe-sql')
        expect(span?.attributes[TRACKSY_ATTR.SQL_REJECTION]).toBeTruthy()
        // The query never ran, so there is nothing to span.
        expect(query).not.toHaveBeenCalled()
        expect(tree().byKind('duckdb')).toHaveLength(0)
    })

    it('nests the retry model call, guardrail and query under the retry', async () => {
        const { engine: fake } = fakeEngine(
            JSON.stringify(
                makeChatAnswer('custom', {
                    sql: 'SELECT nope FROM music_streams',
                })
            ),
            JSON.stringify(
                makeChatAnswer('custom', {
                    sql: 'SELECT artist_name FROM music_streams',
                })
            )
        )
        vi.spyOn(queryDBModule, 'queryDBAsJSON')
            .mockRejectedValueOnce(
                new Error('Binder Error: Referenced column "nope" not found')
            )
            .mockResolvedValueOnce(ROWS)
        const { tracer, tree } = tracedTurn()

        await runAssistantTurn(
            fake,
            config({ chart: 'infer' }),
            'q',
            [],
            undefined,
            tracer
        )

        const { root, byKind, childrenOf, generationsUnder } = tree()
        const retry = byKind('retry')[0]
        const firstQuery = byKind('duckdb')[0]
        expect(firstQuery?.status).toBe('error')
        // The DuckDB error class becomes the error type, which is what a
        // dashboard can group by.
        expect(firstQuery?.error?.kind).toBe('Binder Error')
        expect(retry?.status).toBe('ok')
        expect(retry?.attributes[TRACKSY_ATTR.ROW_COUNT]).toBe(1)
        expect(generationsUnder(retry)).toHaveLength(1)
        expect(
            childrenOf(retry)
                .map((s) => s.kind)
                .filter((kind) => kind !== 'router')
        ).toEqual(['sql-validate', 'duckdb'])
        expect(root?.attributes[TRACKSY_ATTR.RETRIED]).toBe(true)
    })

    it('records the retry failing', async () => {
        const { engine: fake } = fakeEngine(ROUTER_JSON, ROUTER_JSON)
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockRejectedValue(
            new Error('still broken')
        )
        const { tracer, tree } = tracedTurn()

        await runAssistantTurn(fake, config(), 'q', [], undefined, tracer)

        const retry = tree().byKind('retry')[0]
        expect(retry?.status).toBe('error')
        expect(retry?.error?.message).toBe('still broken')
        expect(tree().root?.error?.kind).toBe('sql-error')
        // The first failure was the original query, so that is the cause.
        expect(tree().root?.attributes[TRACKSY_ATTR.ERROR_TYPE]).toBe('_OTHER')
    })

    it('records a chart fallback that askChartConfig decides internally', async () => {
        // The common real failure: the small model emits text that is not a
        // chart config. askChartConfig recovers by itself, so only its
        // `onFallback` report can make the degradation visible.
        const { engine: fake } = fakeEngine(ROUTER_JSON, 'no json here')
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue(ROWS)
        const { tracer, tree } = tracedTurn()

        const result = await runAssistantTurn(
            fake,
            config({ chart: 'llm', narrative: 'static' }),
            'q',
            [],
            undefined,
            tracer
        )

        const { root, byKind, generationsUnder } = tree()
        const chart = byKind('chart').find((s) => s.name === 'chart')
        expect(result.payload.kind).toBe('ok')
        expect(result.chartConfig).toBeDefined()
        expect(generationsUnder(chart)).toHaveLength(1)
        expect(chart?.status).toBe('ok')
        expect(chart?.attributes[TRACKSY_ATTR.CHART_FALLBACK]).toBe(true)
        expect(chart?.attributes[TRACKSY_ATTR.CHART_FALLBACK_REASON]).toBe(
            'no-json'
        )
        expect(root?.attributes[TRACKSY_ATTR.CHART_FALLBACK]).toBe(true)
    })

    it('records a failed chart call as an error and an engine fallback', async () => {
        const { engine: fake } = fakeEngine(
            ROUTER_JSON,
            new Error('device lost')
        )
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue(ROWS)
        const { tracer, tree } = tracedTurn()

        const result = await runAssistantTurn(
            fake,
            config({ chart: 'llm', narrative: 'static' }),
            'q',
            [],
            undefined,
            tracer
        )

        const chart = tree()
            .byKind('chart')
            .find((s) => s.name === 'chart')
        expect(result.payload.kind).toBe('ok')
        expect(result.chartConfig).toBeUndefined()
        expect(chart?.status).toBe('error')
        expect(chart?.attributes[TRACKSY_ATTR.CHART_FALLBACK_REASON]).toBe(
            'engine'
        )
    })

    it('keeps the turn open until the narrator settles', async () => {
        const { engine: fake } = fakeEngine(ROUTER_JSON)
        vi.spyOn(queryDBModule, 'queryDBAsJSON').mockResolvedValue(ROWS)
        vi.spyOn(askNarratorModule, 'askNarrator').mockResolvedValue('summary')
        const { tracer, tree } = tracedTurn()

        const result = await runAssistantTurn(
            fake,
            config({ chart: 'infer', narrative: 'stream' }),
            'q',
            [],
            undefined,
            tracer
        )

        // The user is still watching the narrative stream: the turn isn't over.
        expect(tree().root?.endTimeUnixNano).toBeUndefined()

        await result.streamNarrator?.(() => {})

        const { root, childrenOf } = tree()
        expect(root?.endTimeUnixNano).toBeDefined()
        const narrator = childrenOf(root).find((s) => s.kind === 'narrator')
        expect(narrator?.status).toBe('ok')
        expect(narrator?.attributes[TRACKSY_ATTR.NARRATIVE_CHARS]).toBe(7)
    })

    it('treats a cancel as a cancel, not an error, and stops generation', async () => {
        const { engine: fake, interruptGenerate } = fakeEngine(
            new Promise<never>(() => {})
        )
        const controller = new AbortController()
        const { tracer, tree } = tracedTurn()

        const pending = runAssistantTurn(
            fake,
            config(),
            'q',
            [],
            controller.signal,
            tracer
        )
        controller.abort()
        const result = await pending

        const { root, byKind } = tree()
        expect(result.payload.kind).toBe('aborted')
        expect(interruptGenerate).toHaveBeenCalledOnce()
        expect(byKind('router').find((s) => s.name === 'router')?.status).toBe(
            'skipped'
        )
        expect(root?.status).toBe('skipped')
        expect(root?.attributes[TRACKSY_ATTR.CANCELLED]).toBe(true)
    })
})
