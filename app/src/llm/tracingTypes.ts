import type { Span } from 'webllm-otel'

/**
 * The tracing surface the assistant pipeline is written against.
 *
 * This file declares types only, and that is the whole point. `runAssistantTurn`
 * runs in production, so it must not take a *runtime* dependency on
 * `webllm-otel` — a value import pulls the library into the bundle even when
 * every call beneath it is dead code. The `Span` import above is `import type`
 * and therefore erased at compile time; it is here so the span shape this app
 * passes around cannot drift from the one the library produces.
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
    setAttributes(attributes: TraceAttributes): void
    end(options?: TurnSpanEndOptions): void
}

/**
 * Tracksy's own vocabulary for the steps of a turn.
 *
 * `chart-fallback` exists because the most interesting failure in this pipeline
 * is a silent one: `askChartConfig` throwing into a bare `catch {}` and the
 * renderer quietly substituting its heuristic. Without a name for it, that
 * degradation is invisible.
 */
export type TurnSpanKind =
    | 'router'
    | 'chart'
    | 'narrator'
    | 'sql-validate'
    | 'duckdb'
    | 'retry'
    | 'chart-fallback'

export type TurnTracer = {
    /** Opens a span under the current turn. */
    span(
        kind: TurnSpanKind,
        name: string,
        attributes?: TraceAttributes
    ): TurnSpan
    /**
     * Returns the engine wrapped so each completion becomes a span attributed to
     * `kind`. Passed explicitly rather than inferred from ambient state, because
     * the narrator runs from a callback long after the turn returned.
     */
    wrapEngine<E>(engine: E, kind: TurnSpanKind): E
    /** Closes the turn. Further spans may still arrive from deferred callbacks. */
    end(options?: TurnSpanEndOptions): void
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
} as const
