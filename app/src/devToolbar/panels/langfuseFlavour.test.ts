import { describe, expect, it } from 'vitest'
import type { Span } from 'webllm-otel'
import { withLangfuseAttributes } from './langfuseFlavour'

const TRACE = 'a'.repeat(32)
// 2023-11-14T22:13:20.000Z in nanoseconds.
const START = '1700000000000000000'

function span(overrides: Partial<Span>): Span {
    return {
        traceId: TRACE,
        spanId: 'r'.repeat(16),
        name: 'assistant-turn',
        kind: 'turn',
        startTimeUnixNano: START,
        status: 'ok',
        attributes: {},
        ...overrides,
    }
}

const root = span({
    attributes: {
        'tracksy.question': 'top artists?',
        'tracksy.payload_kind': 'ok',
        'tracksy.model_id': 'Qwen-0.5B',
        'tracksy.retried': true,
        'tracksy.chart_fallback': true,
        'tracksy.eval_case': 'top-artists',
        'session.id': 'session-1',
        'deployment.environment.name': 'eval',
    },
})

const generation = span({
    spanId: 'g'.repeat(16),
    parentSpanId: 'c'.repeat(16),
    name: 'chat Qwen-0.5B',
    kind: 'chart',
    attributes: {
        'gen_ai.operation.name': 'chat',
        'gen_ai.response.time_to_first_chunk': 0.25,
    },
})

const chartStep = span({
    spanId: 'c'.repeat(16),
    parentSpanId: root.spanId,
    name: 'chart',
    kind: 'chart',
    attributes: {
        'tracksy.chart_fallback': true,
        'tracksy.chart_fallback_reason': 'invalid-json',
    },
})

const failedQuery = span({
    spanId: 'd'.repeat(16),
    parentSpanId: root.spanId,
    name: 'query',
    kind: 'duckdb',
    status: 'error',
    error: { kind: 'Binder Error', message: 'no such column' },
})

function mapped() {
    const out = withLangfuseAttributes([
        root,
        chartStep,
        generation,
        failedQuery,
    ])
    return Object.fromEntries(out.map((s) => [s.name, s.attributes]))
}

describe('withLangfuseAttributes', () => {
    it('turns root attributes into trace tags and filterable metadata', () => {
        const attributes = mapped()['assistant-turn']
        expect(attributes?.['langfuse.trace.tags']).toEqual([
            'outcome:ok',
            'retried',
            'chart-fallback',
        ])
        expect(attributes).toMatchObject({
            'langfuse.trace.metadata.payload_kind': 'ok',
            'langfuse.trace.metadata.model_id': 'Qwen-0.5B',
            'langfuse.trace.metadata.retried': 'true',
            'langfuse.trace.metadata.eval_case': 'top-artists',
            'langfuse.observation.input': '{"question":"top artists?"}',
            'langfuse.observation.output': '{"outcome":"ok"}',
        })
    })

    it('propagates the session and environment to every span', () => {
        for (const attributes of Object.values(mapped())) {
            expect(attributes['session.id']).toBe('session-1')
            expect(attributes['deployment.environment.name']).toBe('eval')
        }
    })

    it('marks model calls as generations with a completion start time', () => {
        expect(mapped()['chat Qwen-0.5B']).toMatchObject({
            'langfuse.observation.type': 'generation',
            'langfuse.observation.metadata.agent': 'chart',
            'langfuse.observation.completion_start_time':
                '2023-11-14T22:13:20.250Z',
        })
    })

    it('types steps and levels degradations apart from errors', () => {
        const all = mapped()
        expect(all['chart']).toMatchObject({
            'langfuse.observation.type': 'agent',
            'langfuse.observation.level': 'WARNING',
            'langfuse.observation.metadata.chart_fallback_reason':
                'invalid-json',
        })
        expect(all['query']).toMatchObject({
            'langfuse.observation.type': 'tool',
            'langfuse.observation.level': 'ERROR',
            'langfuse.observation.metadata.error_type': 'Binder Error',
        })
    })

    it('tags a model-load trace with its reason and model', () => {
        const [load] = withLangfuseAttributes([
            span({
                name: 'model-load',
                kind: 'model-load',
                attributes: {
                    'tracksy.model_id': 'Qwen-0.5B',
                    'tracksy.model_load_reason': 'switch',
                },
            }),
        ])
        expect(load?.attributes['langfuse.trace.tags']).toEqual([
            'model-load',
            'load:switch',
            'model:Qwen-0.5B',
        ])
    })

    it('gives steps an input and output, and leaves model calls to gen_ai.*', () => {
        const all = mapped()
        expect(all['query']).toMatchObject({
            'langfuse.observation.output': '{"error":"no such column"}',
        })
        expect(all['chart']?.['langfuse.observation.output']).toBe(
            '{"fallback":true,"reason":"invalid-json"}'
        )
        expect(
            all['chat Qwen-0.5B']?.['langfuse.observation.input']
        ).toBeUndefined()
    })

    it('shows the router decision: question in, intent and SQL out', () => {
        const [, router] = withLangfuseAttributes([
            root,
            span({
                spanId: 'x'.repeat(16),
                parentSpanId: root.spanId,
                name: 'router',
                kind: 'router',
                attributes: {
                    'tracksy.intent': 'top_artists',
                    'tracksy.sql': 'SELECT 1',
                },
            }),
        ])
        expect(router?.attributes).toMatchObject({
            'langfuse.observation.input': '{"question":"top artists?"}',
            'langfuse.observation.output':
                '{"intent":"top_artists","sql":"SELECT 1"}',
        })
    })

    it('tags a failed turn with its failure class', () => {
        const [failed] = withLangfuseAttributes([
            span({
                attributes: {
                    'tracksy.payload_kind': 'llm-error',
                    'tracksy.error_type': 'schema',
                },
            }),
        ])
        expect(failed?.attributes['langfuse.trace.tags']).toEqual([
            'outcome:llm-error',
            'error:schema',
        ])
        expect(failed?.attributes['langfuse.trace.metadata.error_type']).toBe(
            'schema'
        )
    })

    it('does not mutate its input', () => {
        withLangfuseAttributes([root])
        expect(root.attributes['langfuse.trace.tags']).toBeUndefined()
    })
})
