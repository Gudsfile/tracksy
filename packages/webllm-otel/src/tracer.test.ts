import { describe, expect, it, vi } from 'vitest'
import { createTracer } from './tracer.js'
import type { Span } from './types.js'

/** A clock that advances one millisecond per read, so durations are exact. */
function steppingClock(start = 1_700_000_000_000): () => number {
    let current = start
    return () => (current += 1)
}

describe('createTracer', () => {
    it('records a root span for the run', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun({ name: 'turn', attributes: { seat: 3 } })
        run.end()

        const [record] = tracer.getRuns()
        expect(record?.name).toBe('turn')
        expect(record?.attributes).toEqual({ seat: 3 })
        expect(record?.spans).toHaveLength(1)
        expect(record?.spans[0]?.spanId).toBe(run.rootSpanId)
        expect(record?.status).toBe('ok')
    })

    it('parents spans to the root by default', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun()
        run.startSpan({ name: 'validate', kind: 'guardrail' }).end()

        const child = tracer.getRuns()[0]?.spans[1]
        expect(child?.parentSpanId).toBe(run.rootSpanId)
        expect(child?.traceId).toBe(run.traceId)
    })

    it('honours an explicit parent', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun()
        const parent = run.startSpan({ name: 'outer', kind: 'step' })
        run.startSpan({
            name: 'inner',
            kind: 'step',
            parentSpanId: parent.spanId,
        })

        expect(tracer.getRuns()[0]?.spans[2]?.parentSpanId).toBe(parent.spanId)
    })

    it('leaves an in-flight span without a status', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun()
        run.startSpan({ name: 'pending', kind: 'step' })

        // Unfinished must not read as successful.
        expect(tracer.getRuns()[0]?.spans[1]?.status).toBeUndefined()
    })

    it('computes duration from the injected clock', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun()
        run.startSpan({ name: 'work', kind: 'step' }).end()

        expect(tracer.getRuns()[0]?.spans[1]?.durationMs).toBe(1)
    })

    it('never reports a negative duration when the clock steps backwards', () => {
        const readings = [1_000, 900]
        let index = 0
        const tracer = createTracer({ now: () => readings[index++] ?? 0 })
        const run = tracer.startRun()
        run.end()

        expect(tracer.getRuns()[0]?.durationMs).toBe(0)
    })

    it('infers the error status from an error', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun()
        run.startSpan({ name: 'parse', kind: 'step' }).end({
            error: { kind: 'parse', message: 'bad json' },
        })

        const span = tracer.getRuns()[0]?.spans[1]
        expect(span?.status).toBe('error')
        expect(span?.error).toEqual({ kind: 'parse', message: 'bad json' })
    })

    it('lets an explicit status override the inferred one', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun()
        run.startSpan({ name: 'chart', kind: 'step' }).end({
            status: 'skipped',
            error: { message: 'fell back to heuristic' },
        })

        expect(tracer.getRuns()[0]?.spans[1]?.status).toBe('skipped')
    })

    it('ignores a second end, so `finally` blocks are safe', () => {
        const onSpanEnd = vi.fn()
        const tracer = createTracer({ now: steppingClock(), onSpanEnd })
        const run = tracer.startRun()
        const span = run.startSpan({ name: 'work', kind: 'step' })

        span.end({ status: 'ok' })
        span.end({ error: { message: 'too late' } })

        expect(onSpanEnd).toHaveBeenCalledTimes(1)
        expect(tracer.getRuns()[0]?.spans[1]?.status).toBe('ok')
        expect(tracer.getRuns()[0]?.spans[1]?.error).toBeUndefined()
    })

    it('drops undefined attributes rather than recording them', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun()
        run.startSpan({
            name: 'work',
            kind: 'step',
            attributes: { kept: 'yes', dropped: undefined },
        })

        const attributes = tracer.getRuns()[0]?.spans[1]?.attributes
        expect(attributes).toEqual({ kept: 'yes' })
        expect('dropped' in (attributes ?? {})).toBe(false)
    })

    it('merges attributes supplied at end time', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun()
        const span = run.startSpan({
            name: 'work',
            kind: 'step',
            attributes: { a: 1 },
        })
        span.setAttributes({ b: 2 })
        span.end({ attributes: { c: 3 } })

        expect(tracer.getRuns()[0]?.spans[1]?.attributes).toEqual({
            a: 1,
            b: 2,
            c: 3,
        })
    })

    it('notifies onSpanEnd with the completed span', () => {
        const ended: Span[] = []
        const tracer = createTracer({
            now: steppingClock(),
            onSpanEnd: (span) => ended.push(span),
        })
        const run = tracer.startRun({ name: 'turn' })
        run.startSpan({ name: 'work', kind: 'step' }).end()
        run.end()

        expect(ended.map((span) => span.name)).toEqual(['work', 'turn'])
        expect(ended[0]?.endTimeUnixNano).toBeDefined()
    })

    it('evicts the oldest runs beyond maxRuns', () => {
        const tracer = createTracer({ now: steppingClock(), maxRuns: 2 })
        tracer.startRun({ name: 'first' })
        tracer.startRun({ name: 'second' })
        tracer.startRun({ name: 'third' })

        expect(tracer.getRuns().map((run) => run.name)).toEqual([
            'second',
            'third',
        ])
    })

    it('hands out a snapshot, so callers cannot corrupt the buffer', () => {
        const tracer = createTracer({ now: steppingClock() })
        tracer.startRun({ name: 'kept' })

        tracer.getRuns().length = 0

        expect(tracer.getRuns()).toHaveLength(1)
    })

    it('clears the buffer', () => {
        const tracer = createTracer({ now: steppingClock() })
        tracer.startRun()
        tracer.clear()

        expect(tracer.getRuns()).toEqual([])
    })

    it('exposes the live record while the run is in flight', () => {
        const tracer = createTracer({ now: steppingClock() })
        const run = tracer.startRun()
        run.startSpan({ name: 'work', kind: 'step' })

        expect(run.record.spans).toHaveLength(2)
        expect(run.record.endTimeUnixNano).toBeUndefined()
    })
})

describe('a disabled tracer', () => {
    it('records nothing and reports itself disabled', () => {
        const onSpanEnd = vi.fn()
        const tracer = createTracer({ enabled: false, onSpanEnd })
        const run = tracer.startRun({ name: 'turn' })
        run.startSpan({ name: 'work', kind: 'step' }).end()
        run.end()

        expect(tracer.enabled).toBe(false)
        expect(run.enabled).toBe(false)
        expect(tracer.getRuns()).toEqual([])
        expect(onSpanEnd).not.toHaveBeenCalled()
    })

    it('reuses one inert run rather than allocating per call', () => {
        const tracer = createTracer({ enabled: false })
        expect(tracer.startRun()).toBe(tracer.startRun())
    })

    it('still reports captureContent, which callers branch on', () => {
        expect(
            createTracer({ enabled: false, captureContent: false })
                .captureContent
        ).toBe(false)
    })
})
