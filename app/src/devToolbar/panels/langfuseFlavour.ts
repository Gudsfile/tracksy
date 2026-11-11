import type { Attributes, Span } from 'webllm-otel'
import { GEN_AI } from 'webllm-otel'
import { OTEL_ATTR, TRACKSY_ATTR } from '../../llm/tracingTypes'

/**
 * Langfuse-specific attributes, added at export time only.
 *
 * The pipeline records backend-neutral spans (`gen_ai.*`, `tracksy.*`, standard
 * OTel keys). Langfuse reads some of that natively, but its filters, tags,
 * observation types and time-to-first-token need its own `langfuse.*` keys.
 * Deriving them here keeps that vocabulary out of the pipeline and the library:
 * swap the backend and only this file changes.
 *
 * What this adds still passes through the proxy's allow-list redaction
 * (`redactSpanContent`), so nothing here can widen what leaves the machine.
 *
 * @see https://langfuse.com/integrations/native/opentelemetry
 */

const LANGFUSE_ATTR = {
    TRACE_TAGS: 'langfuse.trace.tags',
    TRACE_METADATA: 'langfuse.trace.metadata.',
    OBSERVATION_TYPE: 'langfuse.observation.type',
    OBSERVATION_LEVEL: 'langfuse.observation.level',
    OBSERVATION_METADATA: 'langfuse.observation.metadata.',
    COMPLETION_START_TIME: 'langfuse.observation.completion_start_time',
    /**
     * What Langfuse shows as a span's Input / Output, as JSON strings. These are
     * content (the question, SQL, error text): they are deliberately absent
     * from {@link LANGFUSE_EXPORTABLE_KEYS}, so the proxy strips them for a
     * remote host unless `LANGFUSE_EXPORT_CONTENT=true`.
     */
    OBSERVATION_INPUT: 'langfuse.observation.input',
    OBSERVATION_OUTPUT: 'langfuse.observation.output',
} as const

/** Root-span attributes promoted to filterable trace metadata. */
const TRACE_METADATA_KEYS = {
    payload_kind: TRACKSY_ATTR.PAYLOAD_KIND,
    model_id: TRACKSY_ATTR.MODEL_ID,
    intent: TRACKSY_ATTR.INTENT,
    chart_mode: TRACKSY_ATTR.CHART_MODE,
    narrative_mode: TRACKSY_ATTR.NARRATIVE_MODE,
    eval_case: TRACKSY_ATTR.EVAL_CASE,
    retried: TRACKSY_ATTR.RETRIED,
    chart_fallback: TRACKSY_ATTR.CHART_FALLBACK,
    cancelled: TRACKSY_ATTR.CANCELLED,
    engine_reused: TRACKSY_ATTR.ENGINE_REUSED,
    model_load_reason: TRACKSY_ATTR.MODEL_LOAD_REASON,
    error_type: TRACKSY_ATTR.ERROR_TYPE,
} as const

/** Keys this module can emit, for the redaction allow-list. */
export const LANGFUSE_EXPORTABLE_KEYS: readonly string[] = [
    LANGFUSE_ATTR.TRACE_TAGS,
    LANGFUSE_ATTR.OBSERVATION_TYPE,
    LANGFUSE_ATTR.OBSERVATION_LEVEL,
    LANGFUSE_ATTR.COMPLETION_START_TIME,
    `${LANGFUSE_ATTR.OBSERVATION_METADATA}agent`,
    `${LANGFUSE_ATTR.OBSERVATION_METADATA}error_type`,
    `${LANGFUSE_ATTR.OBSERVATION_METADATA}chart_fallback_reason`,
    ...Object.keys(TRACE_METADATA_KEYS).map(
        (key) => `${LANGFUSE_ATTR.TRACE_METADATA}${key}`
    ),
]

/**
 * Langfuse observation types by span kind. Steps the pipeline owns are agents,
 * the SQL check is a guardrail (a native Langfuse type), DuckDB is a tool.
 */
const OBSERVATION_TYPE: Record<string, string> = {
    router: 'agent',
    chart: 'agent',
    narrator: 'agent',
    'sql-validate': 'guardrail',
    duckdb: 'tool',
    retry: 'chain',
    'model-load': 'span',
}

/** Trace-level keys copied to every span, which Langfuse needs to filter on. */
const PROPAGATED = [OTEL_ATTR.SESSION_ID, OTEL_ATTR.ENVIRONMENT] as const

const isGeneration = (span: Span) => GEN_AI.OPERATION_NAME in span.attributes

/** Nanosecond string + seconds → ISO 8601, the format Langfuse expects. */
function addSeconds(startTimeUnixNano: string, seconds: number): string {
    const startMs = Number(BigInt(startTimeUnixNano) / 1_000_000n)
    return new Date(startMs + seconds * 1000).toISOString()
}

function tagsFor(root: Span): string[] {
    const a = root.attributes
    const tags: string[] = []
    if (root.kind === 'model-load') {
        tags.push('model-load')
        if (typeof a[TRACKSY_ATTR.MODEL_LOAD_REASON] === 'string') {
            tags.push(`load:${a[TRACKSY_ATTR.MODEL_LOAD_REASON]}`)
        }
        // A load has no generation to carry a model name, so the model rides
        // on a tag: load time per model is the question this trace answers.
        if (typeof a[TRACKSY_ATTR.MODEL_ID] === 'string') {
            tags.push(`model:${a[TRACKSY_ATTR.MODEL_ID]}`)
        }
    }
    if (typeof a[TRACKSY_ATTR.PAYLOAD_KIND] === 'string') {
        tags.push(`outcome:${a[TRACKSY_ATTR.PAYLOAD_KIND]}`)
    }
    // A class, never a message: safe to export, and what "Failure causes"
    // breaks down by.
    if (typeof a[TRACKSY_ATTR.ERROR_TYPE] === 'string') {
        tags.push(`error:${a[TRACKSY_ATTR.ERROR_TYPE]}`)
    }
    if (a[TRACKSY_ATTR.RETRIED] === true) tags.push('retried')
    if (a[TRACKSY_ATTR.CHART_FALLBACK] === true) tags.push('chart-fallback')
    if (a[TRACKSY_ATTR.CANCELLED] === true) tags.push('cancelled')
    if (a[TRACKSY_ATTR.ENGINE_REUSED] === false) tags.push('waited-for-model')
    // The eval case id is deliberately not a tag: dashboards break down by tag,
    // and one tag per case would drown the outcome tags. It is filterable as
    // `langfuse.trace.metadata.eval_case` instead.
    return tags
}

function traceAttributes(root: Span): Attributes {
    const out: Attributes = { [LANGFUSE_ATTR.TRACE_TAGS]: tagsFor(root) }
    for (const [name, key] of Object.entries(TRACE_METADATA_KEYS)) {
        const value = root.attributes[key]
        if (value !== undefined) {
            // Langfuse filters trace metadata as strings.
            out[`${LANGFUSE_ATTR.TRACE_METADATA}${name}`] = String(value)
        }
    }
    return out
}

/** A JSON string of the defined fields, or undefined when none are. */
function json(fields: Record<string, unknown>): string | undefined {
    const defined = Object.fromEntries(
        Object.entries(fields).filter(([, value]) => value !== undefined)
    )
    return Object.keys(defined).length > 0 ? JSON.stringify(defined) : undefined
}

/**
 * Input / Output for the steps and the turn, built from attributes the spans
 * already carry. Model calls need nothing here: Langfuse reads their
 * `gen_ai.prompt` / `gen_ai.completion`. Langfuse v4 takes a trace's own
 * input/output from its root observation, so the root gets them too.
 */
function contentAttributes(span: Span, root: Span | undefined): Attributes {
    const a = span.attributes
    const question = root?.attributes[TRACKSY_ATTR.QUESTION]
    const sql = a[TRACKSY_ATTR.SQL]
    const error = span.error?.message
    let input: string | undefined
    let output: string | undefined

    if (span === root && span.kind === 'turn') {
        input = json({ question })
        output = json({
            outcome: a[TRACKSY_ATTR.PAYLOAD_KIND],
            intent: a[TRACKSY_ATTR.INTENT],
            error,
        })
    } else {
        switch (span.kind) {
            case 'router':
                if (span.name !== 'router') break
                input = json({ question })
                output = json({ intent: a[TRACKSY_ATTR.INTENT], sql, error })
                break
            case 'sql-validate':
                input = json({ sql })
                output = json({
                    ok: span.status !== 'error',
                    rejection: a[TRACKSY_ATTR.SQL_REJECTION],
                })
                break
            case 'duckdb':
                input = json({ sql })
                output = json({ rows: a[TRACKSY_ATTR.ROW_COUNT], error })
                break
            case 'chart':
                if (span.name !== 'chart') break
                output = json({
                    fallback: a[TRACKSY_ATTR.CHART_FALLBACK] === true,
                    reason: a[TRACKSY_ATTR.CHART_FALLBACK_REASON],
                    detail: a[TRACKSY_ATTR.CHART_FALLBACK_DETAIL],
                })
                break
            case 'narrator':
                if (span.name !== 'narrator') break
                output = json({ chars: a[TRACKSY_ATTR.NARRATIVE_CHARS], error })
                break
        }
    }

    const out: Attributes = {}
    if (input) out[LANGFUSE_ATTR.OBSERVATION_INPUT] = input
    if (output) out[LANGFUSE_ATTR.OBSERVATION_OUTPUT] = output
    return out
}

function observationAttributes(span: Span): Attributes {
    const out: Attributes = {}
    if (isGeneration(span)) {
        out[LANGFUSE_ATTR.OBSERVATION_TYPE] = 'generation'
        out[`${LANGFUSE_ATTR.OBSERVATION_METADATA}agent`] = span.kind
        const ttft = span.attributes[GEN_AI.RESPONSE_TIME_TO_FIRST_CHUNK]
        if (typeof ttft === 'number') {
            out[LANGFUSE_ATTR.COMPLETION_START_TIME] = addSeconds(
                span.startTimeUnixNano,
                ttft
            )
        }
    } else if (OBSERVATION_TYPE[span.kind]) {
        out[LANGFUSE_ATTR.OBSERVATION_TYPE] = OBSERVATION_TYPE[span.kind]
    }
    if (span.status === 'error') {
        out[LANGFUSE_ATTR.OBSERVATION_LEVEL] = 'ERROR'
        out[`${LANGFUSE_ATTR.OBSERVATION_METADATA}error_type`] =
            span.error?.kind ?? '_OTHER'
    } else if (
        span.attributes[TRACKSY_ATTR.CHART_FALLBACK] === true ||
        span.attributes[TRACKSY_ATTR.CANCELLED] === true
    ) {
        // Degraded or interrupted, not failed: visible without counting as errors.
        out[LANGFUSE_ATTR.OBSERVATION_LEVEL] = 'WARNING'
    }
    const fallbackReason = span.attributes[TRACKSY_ATTR.CHART_FALLBACK_REASON]
    if (typeof fallbackReason === 'string') {
        out[`${LANGFUSE_ATTR.OBSERVATION_METADATA}chart_fallback_reason`] =
            fallbackReason
    }
    return out
}

/** Returns copies of `spans` with the Langfuse keys added. Pure. */
export function withLangfuseAttributes(spans: Span[]): Span[] {
    const roots = new Map<string, Span>()
    for (const span of spans) {
        if (span.parentSpanId === undefined) roots.set(span.traceId, span)
    }

    return spans.map((span) => {
        const root = roots.get(span.traceId)
        const propagated: Attributes = {}
        for (const key of PROPAGATED) {
            const value = root?.attributes[key]
            if (value !== undefined) propagated[key] = value
        }
        return {
            ...span,
            attributes: {
                ...span.attributes,
                ...propagated,
                ...(span === root && traceAttributes(span)),
                ...observationAttributes(span),
                ...(isGeneration(span) ? {} : contentAttributes(span, root)),
            },
        }
    })
}
