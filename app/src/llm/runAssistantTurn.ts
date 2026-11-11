import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import { queryDBAsJSON } from '../db/queries/queryDB'
import { askLLM } from './askLLM'
import { validateSql } from './sqlSafety'
import type { AssistantConfig } from './assistantConfig'
import type { ChartConfig, ChartFallback } from './askChartConfig'
import { LLMError, type AssistantPayload, type ChatMessage } from './types'
// `TRACKSY_ATTR` is a plain object of strings; `TurnTracer` is type-only. Neither
// pulls `webllm-otel` in — see `tracingTypes`.
import {
    TRACKSY_ATTR,
    type TraceError,
    type TurnSpan,
    type TurnSpanEndOptions,
    type TurnTracer,
} from './tracingTypes'

type QueryResult = Record<string, string | number | null>

export const toMessage = (e: unknown): string =>
    e instanceof Error ? e.message : String(e)

/** DuckDB prefixes its messages with a class: `Binder Error: …`. */
const DUCKDB_ERROR_CLASS = /^([A-Z][A-Za-z]*(?: [A-Z][A-Za-z]*)? Error):/

function describeError(cause: unknown): TraceError {
    if (cause instanceof LLMError) {
        return { kind: cause.kind, message: cause.message }
    }
    const message = toMessage(cause)
    const duckdbClass = DUCKDB_ERROR_CLASS.exec(message)?.[1]
    return duckdbClass ? { kind: duckdbClass, message } : { message }
}

const isAbort = (cause: unknown): boolean =>
    cause instanceof LLMError && cause.kind === 'aborted'

/** How a step span ends when its work threw. A cancel is not a failure. */
function stepFailure(cause: unknown): TurnSpanEndOptions {
    return isAbort(cause)
        ? { status: 'skipped', attributes: { [TRACKSY_ATTR.CANCELLED]: true } }
        : { error: describeError(cause) }
}

/** How the turn's root span ends, from what the user was shown. */
function turnOutcome(payload: AssistantPayload): TurnSpanEndOptions {
    const attributes = { [TRACKSY_ATTR.PAYLOAD_KIND]: payload.kind }
    switch (payload.kind) {
        case 'ok':
            return { status: 'ok', attributes }
        case 'aborted':
            return {
                status: 'skipped',
                attributes: { ...attributes, [TRACKSY_ATTR.CANCELLED]: true },
            }
        case 'unsafe-sql':
            return {
                error: { kind: payload.kind, message: payload.reason },
                attributes,
            }
        case 'sql-error':
        case 'llm-error':
            return {
                error: { kind: payload.kind, message: payload.error },
                attributes,
            }
    }
}

/**
 * Why a failed turn failed, as a class: the error kind of the earliest step
 * that failed (`schema`, `Binder Error`, `unsafe-sql`…). Recorded on the root
 * so a dashboard can break failures down by cause — step attributes are not a
 * dimension backends can group on. Undefined for a turn that did not fail.
 */
function failureCause(
    payload: AssistantPayload,
    tracer: TurnTracer
): string | undefined {
    if (payload.kind === 'ok' || payload.kind === 'aborted') return undefined
    const failed = tracer
        .spans()
        .find(
            (span) => span.parentSpanId !== undefined && span.status === 'error'
        )
    return failed?.error?.kind ?? '_OTHER'
}

export type AskResult = {
    payload: AssistantPayload
    rows?: QueryResult[]
    chartConfig?: ChartConfig
    /**
     * Call after rendering the chart to stream a narrative summary of `rows`.
     * Only attached when the active config's narrative mode is `stream`;
     * otherwise the UI shows the static explanation. Absent when not available.
     * The turn's trace stays open until this settles, so callers must call it
     * whenever it is present.
     */
    streamNarrator?: (onChunk: (delta: string) => void) => Promise<string>
}

/**
 * One assistant turn: question in, rendered answer out.
 *
 * The chain is router → SQL guardrail → DuckDB → (retry) → chart → narrator.
 * It lives here rather than inside `useChatEngine` so it can be driven by
 * something other than a React render — the dev eval runner executes the very
 * same function, which is the only way its scores can be said to measure the
 * production path.
 *
 * Errors are returned as payloads rather than thrown; an aborted turn becomes
 * `{ kind: 'aborted' }`.
 *
 * `tracer` is absent in production. Every instrumentation call is written
 * `tracer?.…`, which short-circuits before its arguments are even constructed,
 * so the cost when untraced is one nullish check per step. When present, this
 * function owns the end of the turn: it closes the root span itself, after the
 * narrator when one streams, so the root measures what the user waits for.
 */
export async function runAssistantTurn(
    engine: MLCEngineInterface,
    config: AssistantConfig,
    userText: string,
    history: ChatMessage[],
    signal?: AbortSignal,
    tracer?: TurnTracer
): Promise<AskResult> {
    const result = await runSteps(
        engine,
        config,
        userText,
        history,
        signal,
        tracer
    )
    if (!tracer) return result

    const endTurn = () => {
        const outcome = turnOutcome(result.payload)
        tracer.end({
            ...outcome,
            attributes: {
                ...outcome.attributes,
                [TRACKSY_ATTR.ERROR_TYPE]: failureCause(result.payload, tracer),
            },
        })
    }
    const narrate = result.streamNarrator
    if (!narrate) {
        endTurn()
        return result
    }
    return {
        ...result,
        streamNarrator: async (onChunk) => {
            try {
                return await narrate(onChunk)
            } finally {
                endTurn()
            }
        },
    }
}

async function runSteps(
    engine: MLCEngineInterface,
    config: AssistantConfig,
    userText: string,
    history: ChatMessage[],
    signal: AbortSignal | undefined,
    tracer: TurnTracer | undefined
): Promise<AskResult> {
    try {
        const answer = await traceStep(
            tracer,
            'router',
            undefined,
            async (span) => {
                const routed = await askLLM(
                    tracer?.wrapEngine(engine, 'router', span) ?? engine,
                    userText,
                    history,
                    signal
                )
                // What the router decided, readable on the step itself.
                span?.setAttributes({
                    [TRACKSY_ATTR.INTENT]: routed.intent,
                    [TRACKSY_ATTR.SQL]: routed.sql,
                })
                return routed
            }
        )
        tracer?.setAttributes({ [TRACKSY_ATTR.INTENT]: answer.intent })

        // Unified path: every answer's SQL is validated and executed
        // exactly once. The chart, the narrative, and the displayed SQL
        // all read from this single result set, so they cannot disagree.
        const validation = validateTraced(tracer, answer.sql ?? '')
        if (!validation.ok) {
            return {
                payload: {
                    kind: 'unsafe-sql',
                    answer,
                    reason: validation.reason,
                },
            }
        }

        let finalAnswer = { ...answer, sql: validation.sql }
        let rows: QueryResult[]
        try {
            rows = await queryTraced(tracer, validation.sql)
        } catch (firstErr) {
            // Retry once: feed the error back to the LLM so it can correct the SQL
            tracer?.setAttributes({ [TRACKSY_ATTR.RETRIED]: true })
            const retrySpan = tracer?.span('retry', 'sql-correction', {
                [TRACKSY_ATTR.RETRIED]: true,
            })
            try {
                const retried = await askLLM(
                    tracer?.wrapEngine(engine, 'router', retrySpan) ?? engine,
                    `${userText}\n\nPrevious SQL failed with: ${toMessage(firstErr)}`,
                    history,
                    signal
                )
                const retryValidation = validateTraced(
                    tracer,
                    retried.sql ?? '',
                    retrySpan
                )
                if (!retryValidation.ok) {
                    retrySpan?.end({
                        error: {
                            kind: 'unsafe-sql',
                            message: retryValidation.reason,
                        },
                    })
                    return {
                        payload: {
                            kind: 'unsafe-sql',
                            answer: retried,
                            reason: retryValidation.reason,
                        },
                    }
                }
                finalAnswer = { ...retried, sql: retryValidation.sql }
                rows = await queryTraced(tracer, retryValidation.sql, retrySpan)
                retrySpan?.end({
                    attributes: { [TRACKSY_ATTR.ROW_COUNT]: rows.length },
                })
            } catch (e) {
                retrySpan?.end(stepFailure(e))
                // A cancellation during the retry surfaces as an aborted
                // LLMError — hand it to the outer handler so the user sees a
                // clean cancellation, not a misleading SQL error.
                if (isAbort(e)) {
                    throw e
                }
                return {
                    payload: {
                        kind: 'sql-error',
                        answer: finalAnswer,
                        error: toMessage(e),
                    },
                }
            }
        }

        const result: AskResult = {
            payload: { kind: 'ok', answer: finalAnswer },
            rows,
        }

        // Chart + narrative are driven by the active config. Skip on
        // empty results — nothing to visualize or narrate.
        if (rows.length > 0) {
            if (config.chart === 'llm') {
                result.chartConfig = await chartTraced(
                    engine,
                    tracer,
                    userText,
                    rows
                )
            } else if (config.chart === 'off') {
                // Minimal: render the rows verbatim as a table.
                result.chartConfig = { type: 'table' }
            }
            // config.chart === 'infer' → leave undefined; GenericChartRenderer
            // applies the heuristic inferConfig itself.

            if (config.narrative === 'stream') {
                result.streamNarrator = (onChunk) =>
                    traceStep(tracer, 'narrator', undefined, async (span) => {
                        const { askNarrator } = await import('./askNarrator')
                        const narrative = await askNarrator(
                            tracer?.wrapEngine(engine, 'narrator', span) ??
                                engine,
                            userText,
                            rows,
                            onChunk,
                            finalAnswer.explanation
                        )
                        span?.setAttributes({
                            [TRACKSY_ATTR.NARRATIVE_CHARS]: narrative.length,
                        })
                        return narrative
                    })
            }
        }

        return result
    } catch (e) {
        if (isAbort(e)) {
            return { payload: { kind: 'aborted' } }
        }
        return {
            payload: {
                kind: 'llm-error',
                error: toMessage(e),
            },
        }
    }
}

/**
 * Runs `work` inside a step span the pipeline owns. The step records why it
 * failed (`error.type` = `LLMError.kind`), which the model-call span beneath it
 * cannot: that call succeeded even when its output was unparseable.
 */
async function traceStep<T>(
    tracer: TurnTracer | undefined,
    kind: 'router' | 'narrator',
    parent: TurnSpan | undefined,
    work: (span: TurnSpan | undefined) => Promise<T>
): Promise<T> {
    const span = tracer?.span(kind, kind, undefined, parent)
    try {
        const value = await work(span)
        span?.end()
        return value
    } catch (e) {
        span?.end(stepFailure(e))
        throw e
    }
}

function validateTraced(
    tracer: TurnTracer | undefined,
    sql: string,
    parent?: TurnSpan
): ReturnType<typeof validateSql> {
    const span = tracer?.span('sql-validate', 'validateSql', undefined, parent)
    const validation = validateSql(sql)
    if (validation.ok) {
        span?.end({ attributes: { [TRACKSY_ATTR.SQL]: validation.sql } })
    } else {
        span?.end({
            error: { kind: 'unsafe-sql', message: validation.reason },
            attributes: { [TRACKSY_ATTR.SQL_REJECTION]: validation.reason },
        })
    }
    return validation
}

async function queryTraced(
    tracer: TurnTracer | undefined,
    sql: string,
    parent?: TurnSpan
): Promise<QueryResult[]> {
    const span = tracer?.span(
        'duckdb',
        'query',
        { [TRACKSY_ATTR.SQL]: sql },
        parent
    )
    try {
        const rows = await queryDBAsJSON<QueryResult>(sql)
        span?.end({ attributes: { [TRACKSY_ATTR.ROW_COUNT]: rows.length } })
        return rows
    } catch (e) {
        span?.end({ error: describeError(e) })
        throw e
    }
}

/**
 * Asks the chart agent for a config. Never throws: on any failure the renderer
 * falls back to the heuristic `inferConfig`, which is no regression for the
 * user but is a degradation worth seeing, so it is recorded on the chart step
 * — including the common case, a small model emitting JSON that won't parse,
 * which `askChartConfig` handles internally.
 */
async function chartTraced(
    engine: MLCEngineInterface,
    tracer: TurnTracer | undefined,
    userText: string,
    rows: QueryResult[]
): Promise<ChartConfig | undefined> {
    const span = tracer?.span('chart', 'chart')
    const recordFallback = (fallback: ChartFallback) => {
        span?.setAttributes({
            [TRACKSY_ATTR.CHART_FALLBACK]: true,
            [TRACKSY_ATTR.CHART_FALLBACK_REASON]: fallback.reason,
            [TRACKSY_ATTR.CHART_FALLBACK_DETAIL]: fallback.detail,
        })
        tracer?.setAttributes({ [TRACKSY_ATTR.CHART_FALLBACK]: true })
    }
    try {
        const { askChartConfig } = await import('./askChartConfig')
        const chartConfig = await askChartConfig(
            tracer?.wrapEngine(engine, 'chart', span) ?? engine,
            userText,
            rows,
            recordFallback
        )
        span?.end()
        return chartConfig
    } catch (chartErr) {
        recordFallback({ reason: 'engine', detail: toMessage(chartErr) })
        span?.end({ error: describeError(chartErr) })
        return undefined
    }
}
