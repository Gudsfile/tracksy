import type { Span } from 'webllm-otel'

/**
 * The tracing surface the assistant pipeline is written against.
 *
 * Nothing here may import `webllm-otel` at runtime. `runAssistantTurn` runs in
 * production, and a value import would pull the library into the bundle even
 * when every call beneath it is dead code. The `Span` import above is
 * `import type`, erased at compile time; it keeps the span shape this app passes
 * around from drifting from the one the library produces. The only runtime
 * export is `TRACKSY_ATTR`, a plain object of strings.
 *
 * The concrete implementation lives in `./tracing`, which is dynamically
 * imported inside an `import.meta.env.DEV` branch and is the only module in the
 * app with a runtime dependency on the library.
 */

export type { Span }

export type TraceAttributeValue = string | number | boolean

/** `undefined` values are dropped rather than recorded. */
export type TraceAttributes = Record<string, TraceAttributeValue | undefined>

export type TraceStatus = 'ok' | 'error' | 'skipped'

export type TraceError = {
    /** `LLMError.kind`, an sqlSafety rejection, a DuckDB failure class. */
    kind?: string
    message: string
}

export type TurnSpanEndOptions = {
    status?: TraceStatus
    error?: TraceError
    attributes?: TraceAttributes
}

export type TurnSpan = {
    /** Opaque; pass the span as a `parent` to nest work under it. */
    readonly id: string
    setAttributes(attributes: TraceAttributes): void
    end(options?: TurnSpanEndOptions): void
}

/**
 * Tracksy's own vocabulary for the steps of a turn.
 *
 * `router`, `chart` and `narrator` are step spans the pipeline owns; the model
 * call each one makes nests beneath it, so a parse error or a chart fallback is
 * recorded on the step that decided it rather than lost.
 */
export type TurnSpanKind =
    | 'router'
    | 'chart'
    | 'narrator'
    | 'sql-validate'
    | 'duckdb'
    | 'retry'
    | 'model-load'

export type TurnTracer = {
    /** Opens a span under `parent`, or under the turn itself. */
    span(
        kind: TurnSpanKind,
        name: string,
        attributes?: TraceAttributes,
        parent?: TurnSpan
    ): TurnSpan
    /**
     * Returns the engine wrapped so each completion becomes a span attributed to
     * `kind`, nested under `parent`. Passed explicitly rather than inferred from
     * ambient state: browsers have no async context, and the narrator runs from
     * a callback long after the turn returned.
     */
    wrapEngine<E>(engine: E, kind: TurnSpanKind, parent?: TurnSpan): E
    /**
     * Closes the turn. Idempotent. `runAssistantTurn` calls it once the turn is
     * truly over, which is after the narrator when one streams.
     */
    end(options?: TurnSpanEndOptions): void
    /** Adds attributes to the turn's root span. */
    setAttributes(attributes: TraceAttributes): void
    /**
     * The spans recorded for *this* turn.
     *
     * Scoped to the turn rather than read off the shared tracer, so an eval
     * result carries exactly its own spans — which is what lets a failing case
     * expand into its trace in place instead of hunting for a trace id.
     */
    spans(): Span[]
}

/** Attribute keys Tracksy adds alongside the library's `gen_ai.*` conventions. */
export const TRACKSY_ATTR = {
    INTENT: 'tracksy.intent',
    SQL: 'tracksy.sql',
    SQL_REJECTION: 'tracksy.sql_rejection',
    ROW_COUNT: 'tracksy.row_count',
    RETRIED: 'tracksy.retried',
    CHART_MODE: 'tracksy.chart_mode',
    NARRATIVE_MODE: 'tracksy.narrative_mode',
    MODEL_ID: 'tracksy.model_id',
    PAYLOAD_KIND: 'tracksy.payload_kind',
    QUESTION: 'tracksy.question',
    EVAL_CASE: 'tracksy.eval_case',
    /** The turn was cancelled by the user. Not an error. */
    CANCELLED: 'tracksy.cancelled',
    /** The chart agent's answer was unusable and the heuristic was used. */
    CHART_FALLBACK: 'tracksy.chart_fallback',
    /** A coarse class (`no-json`, `invalid-json`, `schema`, `engine`). */
    CHART_FALLBACK_REASON: 'tracksy.chart_fallback_reason',
    /** The full parser message. Local only: it can quote model output. */
    CHART_FALLBACK_DETAIL: 'tracksy.chart_fallback_detail',
    NARRATIVE_CHARS: 'tracksy.narrative_chars',
    /** The turn waited for the engine to load this model. */
    ENGINE_REUSED: 'tracksy.engine_reused',
    MODEL_LOAD_REASON: 'tracksy.model_load_reason',
    /** On a failed turn: the error kind of the first step that failed. */
    ERROR_TYPE: 'tracksy.error_type',
} as const

/** Standard OpenTelemetry keys the app sets on the turn's root span. */
export const OTEL_ATTR = {
    /** Groups the turns of one conversation (Langfuse maps it to a session). */
    SESSION_ID: 'session.id',
    /** `dev` for chat turns, `eval` for eval cases. */
    ENVIRONMENT: 'deployment.environment.name',
} as const
