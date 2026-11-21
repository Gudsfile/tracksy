import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import { clearTracedRuns, createTurnTracer, getTracedRuns } from './tracing'
import { TRACKSY_ATTR } from './tracingTypes'
import * as devBusModule from '../devToolbar/devBus'

const COMPLETION = {
    model: 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC',
    usage: { prompt_tokens: 11, completion_tokens: 5 },
    choices: [{ message: { content: '{"intent":"top_artists"}' } }],
}

function fakeEngine(): MLCEngineInterface {
    return {
        chat: {
            completions: { create: vi.fn().mockResolvedValue(COMPLETION) },
        },
    } as unknown as MLCEngineInterface
}

beforeEach(() => {
    clearTracedRuns()
})

describe('createTurnTracer', () => {
    it('records the question and the config on the run', () => {
        const tracer = createTurnTracer({
            question: 'top artists in 2024',
            attributes: { [TRACKSY_ATTR.MODEL_ID]: 'model-x' },
        })
        tracer.end({ status: 'ok' })

        const run = getTracedRuns().at(-1)
        expect(run?.name).toBe('assistant-turn')
        expect(run?.attributes['tracksy.question']).toBe('top artists in 2024')
        expect(run?.attributes[TRACKSY_ATTR.MODEL_ID]).toBe('model-x')
        expect(run?.status).toBe('ok')
        expect(run?.durationMs).toBeGreaterThanOrEqual(0)
    })

    it('collects every step of a turn under one trace id', () => {
        const tracer = createTurnTracer({ question: 'q' })
        tracer.span('sql-validate', 'validateSql').end()
        tracer.span('duckdb', 'query').end({
            attributes: { [TRACKSY_ATTR.ROW_COUNT]: 3 },
        })
        tracer.end()

        const run = getTracedRuns().at(-1)
        // Root span plus the two steps, all sharing the trace id — the
        // correlation the old flat `webllm:inference` event could not express.
        expect(run?.spans).toHaveLength(3)
        expect(new Set(run?.spans.map((s) => s.traceId)).size).toBe(1)
        expect(run?.spans.map((s) => s.kind)).toEqual([
            'turn',
            'sql-validate',
            'duckdb',
        ])
    })

    it('turns a wrapped engine call into a GenAI span', async () => {
        const tracer = createTurnTracer({ question: 'q' })
        const engine = fakeEngine()

        await tracer
            .wrapEngine(engine, 'router')
            .chat.completions.create({ messages: [], temperature: 0.1 })
        tracer.end()

        const span = getTracedRuns()
            .at(-1)
            ?.spans.find((candidate) => candidate.kind === 'router')
        expect(span?.attributes['gen_ai.system']).toBe('webllm')
        expect(span?.attributes['gen_ai.usage.output_tokens']).toBe(5)
        expect(span?.attributes['gen_ai.response.model']).toBe(COMPLETION.model)
    })

    it('keeps the wrapped engine transparent to its caller', async () => {
        const tracer = createTurnTracer({ question: 'q' })
        const engine = fakeEngine()

        const wrapped = tracer.wrapEngine(engine, 'router')

        await expect(
            wrapped.chat.completions.create({ messages: [] })
        ).resolves.toBe(COMPLETION)
    })

    it('bridges each closed span onto the dev bus', () => {
        const emit = vi
            .spyOn(devBusModule.devBus, 'emit')
            .mockImplementation(() => {})

        const tracer = createTurnTracer({ question: 'q' })
        tracer.span('duckdb', 'query').end()
        tracer.end()

        const spanEvents = emit.mock.calls.filter(
            ([type]) => type === 'agent:span'
        )
        expect(spanEvents).toHaveLength(2)
        expect(spanEvents[0]?.[1]).toMatchObject({
            span: { kind: 'duckdb', name: 'query' },
        })
    })

    it('accepts spans from a deferred callback after the run has closed', () => {
        const tracer = createTurnTracer({ question: 'q' })
        tracer.end({ status: 'ok' })

        // The streaming narrator runs from a UI callback once the chart has
        // rendered — well after `ask` returned. Its span still belongs to this
        // trace.
        tracer.span('narrator', 'late').end()

        const run = getTracedRuns().at(-1)
        expect(run?.spans.map((s) => s.kind)).toContain('narrator')
        expect(run?.status).toBe('ok')
    })
})

describe('the traced run buffer', () => {
    it('keeps runs in order and can be cleared', () => {
        createTurnTracer({ question: 'first' }).end()
        createTurnTracer({ question: 'second' }).end()

        expect(
            getTracedRuns().map((run) => run.attributes['tracksy.question'])
        ).toEqual(['first', 'second'])

        clearTracedRuns()
        expect(getTracedRuns()).toEqual([])
    })
})
