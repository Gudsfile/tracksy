import { GEN_AI } from './semconv.js'
import type { AttributeValue, Attributes, RunRecord, Span } from './types.js'

/**
 * OTLP/JSON serialization.
 *
 * Only the JSON encoding is implemented — no protobuf, no OpenTelemetry SDK. It
 * is what OTLP-over-HTTP accepts, it is what Langfuse accepts, and it keeps this
 * package dependency-free, which matters more in a browser bundle than wire
 * compactness does.
 *
 * @see https://opentelemetry.io/docs/specs/otlp/#otlphttp
 */

/** OTLP `SpanKind`. */
const SPAN_KIND_INTERNAL = 1
const SPAN_KIND_CLIENT = 3

/** OTLP `StatusCode`. */
const STATUS_UNSET = 0
const STATUS_OK = 1
const STATUS_ERROR = 2

const SCOPE_NAME = 'webllm-otel'

export type OtlpAnyValue =
    | { stringValue: string }
    | { intValue: string }
    | { doubleValue: number }
    | { boolValue: boolean }

export type OtlpKeyValue = {
    key: string
    value: OtlpAnyValue
}

export type OtlpStatus = {
    code: number
    message?: string
}

export type OtlpSpan = {
    traceId: string
    spanId: string
    parentSpanId?: string
    name: string
    kind: number
    startTimeUnixNano: string
    endTimeUnixNano?: string
    attributes: OtlpKeyValue[]
    status: OtlpStatus
}

export type OtlpTracesPayload = {
    resourceSpans: {
        resource: { attributes: OtlpKeyValue[] }
        scopeSpans: {
            scope: { name: string }
            spans: OtlpSpan[]
        }[]
    }[]
}

function toAnyValue(value: AttributeValue): OtlpAnyValue {
    if (typeof value === 'boolean') return { boolValue: value }
    if (typeof value === 'number') {
        // OTLP encodes 64-bit integers as strings. Token counts are integers and
        // belong in `intValue`; temperature and the like are genuinely floating
        // point and belong in `doubleValue`.
        return Number.isInteger(value)
            ? { intValue: String(value) }
            : { doubleValue: value }
    }
    return { stringValue: value }
}

export function toOtlpAttributes(attributes: Attributes): OtlpKeyValue[] {
    return Object.entries(attributes).map(([key, value]) => ({
        key,
        value: toAnyValue(value),
    }))
}

function toOtlpStatus(span: Span): OtlpStatus {
    if (span.status === 'error') {
        return span.error?.message
            ? { code: STATUS_ERROR, message: span.error.message }
            : { code: STATUS_ERROR }
    }
    if (span.status === 'ok') return { code: STATUS_OK }
    // Both an in-flight span and an explicitly skipped one are genuinely UNSET:
    // no claim is being made about success.
    return { code: STATUS_UNSET }
}

function toOtlpSpan(span: Span): OtlpSpan {
    const attributes = { ...span.attributes }
    // The error classification rides along as an attribute; OTLP's status has
    // room for a message but not for a caller-defined kind.
    if (span.error?.kind !== undefined) {
        attributes['webllm_otel.error.kind'] = span.error.kind
    }

    return {
        traceId: span.traceId,
        spanId: span.spanId,
        ...(span.parentSpanId ? { parentSpanId: span.parentSpanId } : {}),
        name: span.name,
        // Spans carrying GenAI attributes represent a call out to a model, which
        // is CLIENT even though the model happens to be running in this process.
        kind:
            GEN_AI.SYSTEM in span.attributes
                ? SPAN_KIND_CLIENT
                : SPAN_KIND_INTERNAL,
        startTimeUnixNano: span.startTimeUnixNano,
        ...(span.endTimeUnixNano
            ? { endTimeUnixNano: span.endTimeUnixNano }
            : {}),
        attributes: toOtlpAttributes(attributes),
        status: toOtlpStatus(span),
    }
}

/**
 * Builds an OTLP/JSON traces payload from recorded runs.
 *
 * The spans are emitted as-is: because trace and span ids are generated in OTLP
 * form and attributes are named with the GenAI semantic conventions, this is a
 * reshaping step with no semantic mapping — nothing here can disagree with what
 * the trace store holds.
 */
export function toOtlpTraces(
    runs: RunRecord[],
    resourceAttributes: Attributes = {}
): OtlpTracesPayload {
    return spansToOtlpTraces(
        runs.flatMap((run) => run.spans),
        resourceAttributes
    )
}

/**
 * The same, from a flat span list.
 *
 * Spans carry their own `traceId` and `parentSpanId`, so a run is not needed to
 * serialize them — and a consumer that received spans one at a time (over a
 * message channel, say, or a `onSpanEnd` callback) would otherwise have to
 * reassemble runs purely to take them apart again.
 */
export function spansToOtlpTraces(
    spans: Span[],
    resourceAttributes: Attributes = {}
): OtlpTracesPayload {
    return {
        resourceSpans: [
            {
                resource: { attributes: toOtlpAttributes(resourceAttributes) },
                scopeSpans: [
                    {
                        scope: { name: SCOPE_NAME },
                        spans: spans.map(toOtlpSpan),
                    },
                ],
            },
        ],
    }
}

export type ExportOptions = {
    /**
     * OTLP traces endpoint. Against Langfuse this is
     * `<host>/api/public/otel/v1/traces` — but that requires Basic auth built
     * from the **secret** key, so from a browser this should point at your own
     * dev-server proxy, which attaches the header out of reach of the client.
     */
    url: string
    headers?: Record<string, string>
    /** Injectable for tests, or to supply a wrapped/retrying fetch. */
    fetch?: typeof globalThis.fetch
    signal?: AbortSignal
}

const ERROR_BODY_LIMIT = 500

/** POSTs a payload to an OTLP/HTTP endpoint. Throws on a non-2xx response. */
export async function exportOtlp(
    payload: OtlpTracesPayload,
    options: ExportOptions
): Promise<void> {
    const doFetch = options.fetch ?? globalThis.fetch
    const response = await doFetch(options.url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            ...options.headers,
        },
        body: JSON.stringify(payload),
        ...(options.signal ? { signal: options.signal } : {}),
    })

    if (!response.ok) {
        // The body usually explains the rejection — a missing header, a bad
        // timestamp. Surfacing it turns "export failed: 400" into something
        // actionable, truncated so a long HTML error page cannot flood a log.
        let detail = ''
        try {
            const body = await response.text()
            if (body) detail = `: ${body.slice(0, ERROR_BODY_LIMIT)}`
        } catch {
            // An unreadable body is not worth masking the status code over.
        }
        throw new Error(
            `OTLP export failed with ${response.status} ${response.statusText}${detail}`
        )
    }
}
