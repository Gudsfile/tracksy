import { describe, it, expect } from 'vitest'
import type { OtlpSpan, OtlpTracesPayload } from 'webllm-otel'
import { spansToOtlpTraces } from 'webllm-otel'
import { createTurnTracer } from '../llm/tracing'
import { TRACKSY_ATTR } from '../llm/tracingTypes'
import { withLangfuseAttributes } from './panels/langfuseFlavour'
import {
    EXPORTABLE_KEYS,
    isRemoteHost,
    redactSpanContent,
} from './redactSpanContent'

function span(overrides: Partial<OtlpSpan> = {}): OtlpSpan {
    return {
        traceId: 'a'.repeat(32),
        spanId: 'b'.repeat(16),
        name: 'chat.completions.create',
        kind: 3,
        startTimeUnixNano: '1700000000000000000',
        attributes: [
            { key: 'gen_ai.system', value: { stringValue: 'webllm' } },
            {
                key: 'gen_ai.prompt',
                value: { stringValue: 'What did I listen to most?' },
            },
            {
                key: 'gen_ai.completion',
                value: { stringValue: 'Mostly ambient techno.' },
            },
            {
                key: 'gen_ai.usage.input_tokens',
                value: { intValue: '128' },
            },
            { key: 'tracksy.question', value: { stringValue: 'top artist?' } },
            {
                key: 'tracksy.sql',
                value: { stringValue: 'SELECT artist_name FROM streams' },
            },
            {
                key: 'webllm_otel.error.kind',
                value: { stringValue: 'timeout' },
            },
        ],
        status: { code: 1 },
        ...overrides,
    }
}

function payload(spans: OtlpSpan[]): OtlpTracesPayload {
    return {
        resourceSpans: [
            {
                resource: { attributes: [] },
                scopeSpans: [{ scope: { name: 'webllm-otel' }, spans }],
            },
        ],
    }
}

describe('redactSpanContent', () => {
    it('strips gen_ai.prompt and gen_ai.completion from every span', () => {
        const result = redactSpanContent(payload([span(), span()]))
        for (const s of result.resourceSpans[0]?.scopeSpans[0]?.spans ?? []) {
            const keys = s.attributes.map((attribute) => attribute.key)
            expect(keys).not.toContain('gen_ai.prompt')
            expect(keys).not.toContain('gen_ai.completion')
        }
    })

    it('keeps only allow-listed keys: model, tokens, error kind, intent', () => {
        const result = redactSpanContent(payload([span()]))
        const attributes =
            result.resourceSpans[0]?.scopeSpans[0]?.spans[0]?.attributes ?? []
        expect(attributes.map((attribute) => attribute.key)).toEqual([
            'gen_ai.system',
            'gen_ai.usage.input_tokens',
            'webllm_otel.error.kind',
        ])
    })

    it('strips keys nobody listed, so a new content attribute is safe by default', () => {
        const result = redactSpanContent(
            payload([
                span({
                    attributes: [
                        {
                            key: 'gen_ai.input.messages',
                            value: { stringValue: '[{"content":"secret"}]' },
                        },
                        {
                            key: 'some.future.attribute',
                            value: { stringValue: 'secret' },
                        },
                    ],
                }),
            ])
        )
        expect(
            result.resourceSpans[0]?.scopeSpans[0]?.spans[0]?.attributes
        ).toEqual([])
    })

    it('drops the status message, which can quote values', () => {
        const result = redactSpanContent(
            payload([
                span({
                    status: {
                        code: 2,
                        message:
                            'Conversion Error: Could not convert string "Radiohead"',
                    },
                }),
            ])
        )
        expect(
            result.resourceSpans[0]?.scopeSpans[0]?.spans[0]?.status
        ).toEqual({ code: 2 })
    })

    it('lets nothing from a real traced turn leak past it', async () => {
        // The fixture is a real turn: real tracer, real Langfuse mapping, real
        // OTLP serialization. Every content value it carries must be gone.
        const question = 'How often did I play Radiohead?'
        const sql =
            "SELECT COUNT(*) FROM music_streams WHERE artist_name = 'Radiohead'"
        const tracer = createTurnTracer({
            question,
            modelId: 'm',
            sessionId: 's',
        })
        const routerStep = tracer.span('router', 'router')
        const engine = {
            chat: {
                completions: {
                    create: async () => ({
                        choices: [{ message: { content: 'Radiohead answer' } }],
                        usage: { prompt_tokens: 3, completion_tokens: 2 },
                    }),
                },
            },
        }
        await tracer
            .wrapEngine(engine, 'router', routerStep)
            .chat.completions.create()
        routerStep.end({ error: { kind: 'parse', message: 'Radiohead' } })
        tracer.span('duckdb', 'query', { [TRACKSY_ATTR.SQL]: sql }).end()
        tracer.end({ status: 'ok' })

        const exported = redactSpanContent(
            spansToOtlpTraces(withLangfuseAttributes(tracer.spans()))
        )
        const json = JSON.stringify(exported)

        expect(json).not.toContain('Radiohead')
        const keys = exported.resourceSpans.flatMap((resource) =>
            resource.scopeSpans.flatMap((scope) =>
                scope.spans.flatMap((s) => s.attributes.map((a) => a.key))
            )
        )
        for (const key of keys) expect(EXPORTABLE_KEYS).toContain(key)
        // Input/Output previews are content: the mapping produced them, the
        // proxy must have removed them.
        expect(keys).not.toContain('langfuse.observation.input')
        expect(keys).not.toContain('langfuse.observation.output')
        // What the dashboards need survives.
        expect(keys).toEqual(
            expect.arrayContaining([
                'session.id',
                'gen_ai.usage.input_tokens',
                'error.type',
                'langfuse.trace.tags',
                'langfuse.observation.type',
            ])
        )
    })

    it('preserves the span tree — ids, kind, status, parentSpanId', () => {
        const original = span({ parentSpanId: 'c'.repeat(16) })
        const result = redactSpanContent(payload([original]))
        const stripped = result.resourceSpans[0]?.scopeSpans[0]?.spans[0]
        expect(stripped).toMatchObject({
            traceId: original.traceId,
            spanId: original.spanId,
            parentSpanId: original.parentSpanId,
            name: original.name,
            kind: original.kind,
            status: original.status,
        })
    })

    it('is a no-op on a payload that already has no content attributes', () => {
        const clean = span({
            attributes: [
                { key: 'gen_ai.system', value: { stringValue: 'webllm' } },
            ],
        })
        const result = redactSpanContent(payload([clean]))
        expect(
            result.resourceSpans[0]?.scopeSpans[0]?.spans[0]?.attributes
        ).toEqual(clean.attributes)
    })

    it('passes a malformed payload through untouched rather than throwing', () => {
        // @ts-expect-error deliberately malformed input
        expect(redactSpanContent(null)).toBeNull()
        // @ts-expect-error deliberately malformed input
        expect(redactSpanContent(undefined)).toBeUndefined()
        // @ts-expect-error deliberately malformed input
        expect(redactSpanContent({})).toEqual({})
        const weird = { resourceSpans: [{}] }
        // @ts-expect-error deliberately malformed input
        expect(redactSpanContent(weird)).toEqual(weird)
        const weirder = { resourceSpans: [{ scopeSpans: [{}] }] }
        // @ts-expect-error deliberately malformed input
        expect(redactSpanContent(weirder)).toEqual(weirder)
        const weirdest = {
            resourceSpans: [{ scopeSpans: [{ spans: [{}] }] }],
        }
        // @ts-expect-error deliberately malformed input
        expect(redactSpanContent(weirdest)).toEqual(weirdest)
    })
})

describe('isRemoteHost', () => {
    it('treats localhost variants as local', () => {
        expect(isRemoteHost('http://localhost:3000')).toBe(false)
        expect(isRemoteHost('http://127.0.0.1:3000')).toBe(false)
        expect(isRemoteHost('http://[::1]:3000')).toBe(false)
        expect(isRemoteHost('http://host.docker.internal:3000')).toBe(false)
        expect(isRemoteHost('http://localhost')).toBe(false)
    })

    it('treats a Langfuse Cloud host as remote', () => {
        expect(isRemoteHost('https://cloud.langfuse.com')).toBe(true)
        expect(isRemoteHost('https://us.cloud.langfuse.com')).toBe(true)
    })

    it('treats a remote host with a port as remote', () => {
        expect(isRemoteHost('https://langfuse.example.com:8443')).toBe(true)
    })

    it('treats an unparsable URL as remote, so the safe default wins', () => {
        expect(isRemoteHost('not a url')).toBe(true)
        expect(isRemoteHost('')).toBe(true)
    })
})
