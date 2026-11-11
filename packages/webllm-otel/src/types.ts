/** Attribute values OTLP can represent without nesting. */
export type AttributeValue = string | number | boolean

export type Attributes = Record<string, AttributeValue>

/**
 * Attributes as callers supply them. `undefined` is allowed and dropped rather
 * than recorded, so callers can write `{ model: maybeModel }` without guarding
 * every field at the call site.
 */
export type AttributeInput = Record<string, AttributeValue | undefined>

export type SpanStatus = 'ok' | 'error' | 'skipped'

export type SpanError = {
    /**
     * A caller-defined classification — `'parse'`, `'timeout'`, an HTTP status.
     * Kept free-form because what counts as a useful error taxonomy belongs to
     * the application, not to this library.
     */
    kind?: string
    message: string
}

/**
 * A completed or in-flight unit of work.
 *
 * Timestamps are nanoseconds since the Unix epoch, held as decimal strings: the
 * values exceed `Number.MAX_SAFE_INTEGER`, and OTLP/JSON encodes its `fixed64`
 * fields as strings for exactly that reason. `durationMs` is carried alongside
 * as a plain number so a UI never has to do 64-bit arithmetic to render a
 * duration.
 */
export type Span = {
    traceId: string
    spanId: string
    parentSpanId?: string
    /** Human-readable label, e.g. `'chat.completions.create'`. */
    name: string
    /**
     * The application's own vocabulary for what this span is — `'router'`,
     * `'duckdb'`, `'guardrail'`. Deliberately an open string: a closed union
     * here would mean every consumer had to fit its domain into terms this
     * library invented.
     */
    kind: string
    startTimeUnixNano: string
    endTimeUnixNano?: string
    durationMs?: number
    /**
     * Absent while the span is in flight. Leaving it undefined rather than
     * defaulting to `'ok'` keeps an unfinished span from reading as a successful
     * one — it maps to OTLP's `UNSET`, which is what it actually is.
     */
    status?: SpanStatus
    error?: SpanError
    attributes: Attributes
}

/**
 * One traced operation and every span beneath it — in this library's intended
 * use, a single user-facing turn.
 *
 * This is plain data: `Tracer.getRuns()` hands these out for rendering and
 * serialization, with no live handles attached.
 */
export type RunRecord = {
    traceId: string
    rootSpanId: string
    name: string
    startTimeUnixNano: string
    endTimeUnixNano?: string
    durationMs?: number
    status?: SpanStatus
    attributes: Attributes
    /** Ordered by start time; includes the root span. */
    spans: Span[]
}
