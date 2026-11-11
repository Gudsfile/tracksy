import { newSpanId, newTraceId } from './ids.js'
import { defaultClock, toUnixNano, type Clock } from './time.js'
import type {
    AttributeInput,
    Attributes,
    RunRecord,
    Span,
    SpanError,
    SpanStatus,
} from './types.js'

const DEFAULT_MAX_RUNS = 25
const DEFAULT_RUN_NAME = 'run'
const DEFAULT_RUN_KIND = 'run'

export type SpanOptions = {
    name: string
    kind: string
    /** Defaults to the run's root span. */
    parentSpanId?: string
    attributes?: AttributeInput
}

export type SpanEndOptions = {
    /** Defaults to `'ok'`, or `'error'` when {@link SpanEndOptions.error} is set. */
    status?: SpanStatus
    error?: SpanError
    attributes?: AttributeInput
}

export type SpanHandle = {
    readonly traceId: string
    readonly spanId: string
    /** Merges attributes into the span. `undefined` values are ignored. */
    setAttributes(attributes: AttributeInput): void
    /** Idempotent — a second call is ignored, so `finally` blocks are safe. */
    end(options?: SpanEndOptions): void
}

export type RunOptions = {
    name?: string
    kind?: string
    attributes?: AttributeInput
}

export type Run = {
    readonly traceId: string
    readonly rootSpanId: string
    /** False on a disabled tracer, letting callers skip work entirely. */
    readonly enabled: boolean
    /** Mirrors {@link TracerOptions.captureContent}. */
    readonly captureContent: boolean
    /** The live record. Safe to read while the run is in flight. */
    readonly record: RunRecord
    startSpan(options: SpanOptions): SpanHandle
    end(options?: SpanEndOptions): void
}

export type TracerOptions = {
    /**
     * When false, every handle is an inert shared singleton and nothing is
     * retained. This is the switch a consumer wires to its own dev/prod flag —
     * the library deliberately has no opinion about how that flag is derived.
     */
    enabled?: boolean
    /** Ring-buffer size. Oldest runs are evicted. Defaults to 25. */
    maxRuns?: number
    /**
     * When false, prompt and completion text is omitted from spans while token
     * counts, timings, and model metadata are still recorded. Useful when the
     * traced content is sensitive.
     */
    captureContent?: boolean
    /** Invoked as each span closes. */
    onSpanEnd?: (span: Span) => void
    /** Injectable clock, for deterministic tests. */
    now?: Clock
}

export type Tracer = {
    readonly enabled: boolean
    readonly captureContent: boolean
    startRun(options?: RunOptions): Run
    /** A snapshot of the buffer, newest last. */
    getRuns(): RunRecord[]
    clear(): void
}

/** Copies defined values across; `undefined` means "not recorded", not "null". */
function mergeAttributes(
    into: Attributes,
    input: AttributeInput | undefined
): void {
    if (!input) return
    for (const [key, value] of Object.entries(input)) {
        if (value !== undefined) {
            into[key] = value
        }
    }
}

const NOOP_SPAN: SpanHandle = Object.freeze({
    traceId: '',
    spanId: '',
    setAttributes() {},
    end() {},
})

function createNoopRun(captureContent: boolean): Run {
    const record: RunRecord = {
        traceId: '',
        rootSpanId: '',
        name: DEFAULT_RUN_NAME,
        startTimeUnixNano: '0',
        attributes: {},
        spans: [],
    }
    return Object.freeze({
        traceId: '',
        rootSpanId: '',
        enabled: false,
        captureContent,
        record,
        startSpan: () => NOOP_SPAN,
        end() {},
    })
}

export function createTracer(options: TracerOptions = {}): Tracer {
    const {
        enabled = true,
        maxRuns = DEFAULT_MAX_RUNS,
        captureContent = true,
        onSpanEnd,
        now = defaultClock,
    } = options

    if (!enabled) {
        // One shared inert run, so a disabled tracer allocates nothing per call
        // no matter how hot the path is.
        const noopRun = createNoopRun(captureContent)
        return {
            enabled: false,
            captureContent,
            startRun: () => noopRun,
            getRuns: () => [],
            clear() {},
        }
    }

    const runs: RunRecord[] = []

    function startRun(runOptions: RunOptions = {}): Run {
        const traceId = newTraceId()
        const rootSpanId = newSpanId()
        const startedAtMs = now()
        const startTimeUnixNano = toUnixNano(startedAtMs)
        const name = runOptions.name ?? DEFAULT_RUN_NAME

        const attributes: Attributes = {}
        mergeAttributes(attributes, runOptions.attributes)

        const rootSpan: Span = {
            traceId,
            spanId: rootSpanId,
            name,
            kind: runOptions.kind ?? DEFAULT_RUN_KIND,
            startTimeUnixNano,
            attributes: { ...attributes },
        }

        const record: RunRecord = {
            traceId,
            rootSpanId,
            name,
            startTimeUnixNano,
            attributes,
            spans: [rootSpan],
        }

        runs.push(record)
        while (runs.length > maxRuns) {
            runs.shift()
        }

        function closeSpan(
            span: Span,
            spanStartedAtMs: number,
            endOptions: SpanEndOptions | undefined
        ): void {
            // Idempotent: a span may be ended by an explicit call and again by a
            // `finally`, and the first result is the accurate one.
            if (span.endTimeUnixNano !== undefined) return

            const endedAtMs = now()
            span.endTimeUnixNano = toUnixNano(endedAtMs)
            // Clamped because a non-monotonic clock (an injected one, or a wall
            // clock stepped backwards) must not produce a negative duration.
            span.durationMs = Math.max(0, endedAtMs - spanStartedAtMs)

            if (endOptions?.error) {
                span.error = endOptions.error
            }
            span.status =
                endOptions?.status ?? (endOptions?.error ? 'error' : 'ok')

            mergeAttributes(span.attributes, endOptions?.attributes)
            onSpanEnd?.(span)
        }

        function handleFor(span: Span, spanStartedAtMs: number): SpanHandle {
            return {
                traceId,
                spanId: span.spanId,
                setAttributes(attributesToAdd) {
                    mergeAttributes(span.attributes, attributesToAdd)
                },
                end(endOptions) {
                    closeSpan(span, spanStartedAtMs, endOptions)
                },
            }
        }

        return {
            traceId,
            rootSpanId,
            enabled: true,
            captureContent,
            record,
            startSpan(spanOptions) {
                const startedAt = now()
                const span: Span = {
                    traceId,
                    spanId: newSpanId(),
                    parentSpanId: spanOptions.parentSpanId ?? rootSpanId,
                    name: spanOptions.name,
                    kind: spanOptions.kind,
                    startTimeUnixNano: toUnixNano(startedAt),
                    attributes: {},
                }
                mergeAttributes(span.attributes, spanOptions.attributes)
                record.spans.push(span)
                return handleFor(span, startedAt)
            },
            end(endOptions) {
                closeSpan(rootSpan, startedAtMs, endOptions)
                record.endTimeUnixNano = rootSpan.endTimeUnixNano
                record.durationMs = rootSpan.durationMs
                record.status = rootSpan.status
            },
        }
    }

    return {
        enabled: true,
        captureContent,
        startRun,
        getRuns: () => [...runs],
        clear() {
            runs.length = 0
        },
    }
}
