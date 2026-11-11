import { describe, expect, it, vi } from 'vitest'
import {
    exportOtlp,
    spansToOtlpTraces,
    toOtlpAttributes,
    toOtlpTraces,
} from './otlp.js'
import { GEN_AI } from './semconv.js'
import { createTracer } from './tracer.js'
import type { OtlpKeyValue, OtlpTracesPayload } from './otlp.js'

function steppingClock(start = 1_700_000_000_000): () => number {
    let current = start
    return () => (current += 1)
}

function attributeMap(attributes: OtlpKeyValue[]): Record<string, unknown> {
    return Object.fromEntries(
        attributes.map(({ key, value }) => [key, Object.values(value)[0]])
    )
}

function spansOf(payload: OtlpTracesPayload) {
    return payload.resourceSpans[0]?.scopeSpans[0]?.spans ?? []
}

describe('toOtlpAttributes', () => {
    it('encodes each value in its OTLP-typed field', () => {
        const encoded = toOtlpAttributes({
            name: 'router',
            tokens: 42,
            temperature: 0.1,
            streamed: true,
        })

        expect(encoded).toEqual([
            { key: 'name', value: { stringValue: 'router' } },
            // 64-bit integers travel as strings in OTLP/JSON.
            { key: 'tokens', value: { intValue: '42' } },
            { key: 'temperature', value: { doubleValue: 0.1 } },
            { key: 'streamed', value: { boolValue: true } },
        ])
    })

    it('treats a whole-numbered float as an integer', () => {
        // `1.0` and `1` are the same double; there is no way to tell them apart,
        // and intValue is the safer choice for counts.
        expect(toOtlpAttributes({ n: 1.0 })).toEqual([
            { key: 'n', value: { intValue: '1' } },
        ])
    })
})

describe('toOtlpTraces', () => {
    it('emits every span of every run', () => {
        const tracer = createTracer({ now: steppingClock() })
        const first = tracer.startRun({ name: 'turn-1' })
        first.startSpan({ name: 'work', kind: 'step' }).end()
        first.end()
        tracer.startRun({ name: 'turn-2' }).end()

        const spans = spansOf(toOtlpTraces(tracer.getRuns()))

        expect(spans.map((span) => span.name)).toEqual([
            'turn-1',
            'work',
            'turn-2',
        ])
    })

    it('carries ids through verbatim, with no mapping layer', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun()
        const child = run.startSpan({ name: 'work', kind: 'step' })
        child.end()
        run.end()

        const spans = spansOf(toOtlpTraces(tracer.getRuns()))

        expect(spans[0]?.traceId).toBe(run.traceId)
        expect(spans[0]?.traceId).toMatch(/^[0-9a-f]{32}$/)
        expect(spans[1]?.spanId).toMatch(/^[0-9a-f]{16}$/)
        expect(spans[1]?.parentSpanId).toBe(run.rootSpanId)
        // The root has no parent.
        expect(spans[0]?.parentSpanId).toBeUndefined()
    })

    it('maps status onto the OTLP codes', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun()
        run.startSpan({ name: 'ok', kind: 'step' }).end()
        run.startSpan({ name: 'bad', kind: 'step' }).end({
            error: { kind: 'parse', message: 'bad json' },
        })
        run.startSpan({ name: 'skipped', kind: 'step' }).end({
            status: 'skipped',
        })
        run.startSpan({ name: 'inflight', kind: 'step' })
        run.end()

        const byName = Object.fromEntries(
            spansOf(toOtlpTraces(tracer.getRuns())).map((span) => [
                span.name,
                span,
            ])
        )

        expect(byName['ok']?.status).toEqual({ code: 1 })
        expect(byName['bad']?.status).toEqual({ code: 2, message: 'bad json' })
        // Skipped and in-flight both make no claim about success: UNSET.
        expect(byName['skipped']?.status).toEqual({ code: 0 })
        expect(byName['inflight']?.status).toEqual({ code: 0 })
        expect(byName['inflight']?.endTimeUnixNano).toBeUndefined()
    })

    it('carries the error kind as an attribute, since OTLP status has no field for it', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun()
        run.startSpan({ name: 'bad', kind: 'step' }).end({
            error: { kind: 'schema', message: 'missing sql' },
        })
        run.end()

        const span = spansOf(toOtlpTraces(tracer.getRuns())).find(
            (candidate) => candidate.name === 'bad'
        )

        expect(attributeMap(span?.attributes ?? [])).toMatchObject({
            'webllm_otel.error.kind': 'schema',
        })
    })

    it('marks GenAI spans CLIENT and everything else INTERNAL', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun()
        run.startSpan({
            name: 'inference',
            kind: 'router',
            attributes: { [GEN_AI.SYSTEM]: 'webllm' },
        }).end()
        run.startSpan({ name: 'duckdb', kind: 'query' }).end()
        run.end()

        const byName = Object.fromEntries(
            spansOf(toOtlpTraces(tracer.getRuns())).map((span) => [
                span.name,
                span.kind,
            ])
        )

        expect(byName['inference']).toBe(3)
        expect(byName['duckdb']).toBe(1)
    })

    it('attaches resource attributes', () => {
        const tracer = createTracer({ now: steppingClock() })
        tracer.startRun().end()

        const payload = toOtlpTraces(tracer.getRuns(), {
            'service.name': 'example-app',
        })

        expect(
            attributeMap(payload.resourceSpans[0]?.resource.attributes ?? [])
        ).toEqual({ 'service.name': 'example-app' })
        expect(payload.resourceSpans[0]?.scopeSpans[0]?.scope.name).toBe(
            'webllm-otel'
        )
    })

    it('produces a valid payload for no runs', () => {
        expect(spansOf(toOtlpTraces([]))).toEqual([])
    })

    it('round-trips through JSON', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun({ name: 'turn' })
        run.startSpan({
            name: 'work',
            kind: 'step',
            attributes: { n: 1 },
        }).end()
        run.end()

        const payload = toOtlpTraces(tracer.getRuns())

        expect(JSON.parse(JSON.stringify(payload))).toEqual(payload)
    })
})

describe('exportOtlp', () => {
    const payload = toOtlpTraces([])

    it('POSTs JSON to the given url with merged headers', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValue(new Response(null, { status: 202 }))

        await exportOtlp(payload, {
            url: '/__langfuse/v1/traces',
            headers: { 'x-langfuse-ingestion-version': '4' },
            fetch: fetchMock,
        })

        expect(fetchMock).toHaveBeenCalledTimes(1)
        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
        expect(url).toBe('/__langfuse/v1/traces')
        expect(init.method).toBe('POST')
        expect(init.headers).toEqual({
            'content-type': 'application/json',
            'x-langfuse-ingestion-version': '4',
        })
        expect(JSON.parse(init.body as string)).toEqual(payload)
    })

    it('throws with the response body, which is where the reason lives', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response('invalid timestamp', {
                status: 400,
                statusText: 'Bad Request',
            })
        )

        await expect(
            exportOtlp(payload, { url: '/otlp', fetch: fetchMock })
        ).rejects.toThrow(
            'OTLP export failed with 400 Bad Request: invalid timestamp'
        )
    })

    it('still throws when the error body cannot be read', async () => {
        const response = new Response(null, { status: 500 })
        vi.spyOn(response, 'text').mockRejectedValue(new Error('stream closed'))
        const fetchMock = vi.fn().mockResolvedValue(response)

        await expect(
            exportOtlp(payload, { url: '/otlp', fetch: fetchMock })
        ).rejects.toThrow('OTLP export failed with 500')
    })

    it('truncates a long error body', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response('x'.repeat(5000), {
                status: 502,
                statusText: 'Bad Gateway',
            })
        )

        await expect(
            exportOtlp(payload, { url: '/otlp', fetch: fetchMock })
        ).rejects.toThrow(/x{500}$/)
    })

    it('forwards an abort signal', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValue(new Response(null, { status: 200 }))
        const controller = new AbortController()

        await exportOtlp(payload, {
            url: '/otlp',
            fetch: fetchMock,
            signal: controller.signal,
        })

        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
        expect(init.signal).toBe(controller.signal)
    })
})

describe('spansToOtlpTraces', () => {
    it('serializes spans without needing them grouped into runs', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun({ name: 'turn' })
        run.startSpan({ name: 'work', kind: 'step' }).end()
        run.end()

        const spans = tracer.getRuns().flatMap((record) => record.spans)

        // A consumer that received spans one at a time should not have to
        // rebuild runs just to take them apart again.
        expect(spansToOtlpTraces(spans)).toEqual(toOtlpTraces(tracer.getRuns()))
    })

    it('preserves parentage across a flat list', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun()
        run.startSpan({ name: 'child', kind: 'step' }).end()
        run.end()

        const flat = tracer.getRuns().flatMap((record) => record.spans)
        // Shuffle: the wire format carries parentage in the spans themselves,
        // so arrival order must not matter.
        const spans = spansOf(spansToOtlpTraces([...flat].reverse()))

        expect(spans.find((span) => span.name === 'child')?.parentSpanId).toBe(
            run.rootSpanId
        )
    })
})
