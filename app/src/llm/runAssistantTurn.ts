import type { MLCEngineInterface } from '@mlc-ai/web-llm'
import { queryDBAsJSON } from '../db/queries/queryDB'
import { askLLM } from './askLLM'
import { validateSql } from './sqlSafety'
import type { AssistantConfig } from './assistantConfig'
import type { ChartConfig } from './askChartConfig'
import { LLMError, type AssistantPayload, type ChatMessage } from './types'
// Type-only: see `tracingTypes` for why this must never become a value import.
import { TRACKSY_ATTR, type TurnTracer } from './tracingTypes'

type QueryResult = Record<string, string | number | null>

export const toMessage = (e: unknown): string =>
    e instanceof Error ? e.message : String(e)

function describeError(cause: unknown): { kind?: string; message: string } {
    if (cause instanceof LLMError) {
        return { kind: cause.kind, message: cause.message }
    }
    return { message: toMessage(cause) }
}

export type AskResult = {
    payload: AssistantPayload
    rows?: QueryResult[]
    chartConfig?: ChartConfig
    /**
     * Call after rendering the chart to stream a narrative summary of `rows`.
     * Only attached when the active config's narrative mode is `stream`;
     * otherwise the UI shows the static explanation. Absent when not available.
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
 * Errors are returned as payloads rather than thrown; the only exception that
 * escapes is none — an aborted turn becomes `{ kind: 'aborted' }`.
 *
 * `tracer` is absent in production. Every instrumentation call is written
 * `tracer?.…`, which short-circuits before its arguments are even constructed,
 * so the cost when untraced is one nullish check per step.
 */
export async function runAssistantTurn(
    engine: MLCEngineInterface,
    config: AssistantConfig,
    userText: string,
    history: ChatMessage[],
    signal?: AbortSignal,
    tracer?: TurnTracer
): Promise<AskResult> {
    const routerEngine = tracer?.wrapEngine(engine, 'router') ?? engine

    try {
        const answer = await askLLM(routerEngine, userText, history, signal)
        tracer
            ?.span('router', 'answer', {
                [TRACKSY_ATTR.INTENT]: answer.intent,
            })
            .end()

        // Unified path: every answer's SQL is validated and executed
        // exactly once. The chart, the narrative, and the displayed SQL
        // all read from this single result set, so they cannot disagree.
        const validateSpan = tracer?.span('sql-validate', 'validateSql')
        const validation = validateSql(answer.sql ?? '')
        if (!validation.ok) {
            validateSpan?.end({
                error: {
                    kind: 'unsafe-sql',
                    message: validation.reason,
                },
                attributes: { [TRACKSY_ATTR.SQL_REJECTION]: validation.reason },
            })
            return {
                payload: {
                    kind: 'unsafe-sql',
                    answer,
                    reason: validation.reason,
                },
            }
        }
        validateSpan?.end({
            attributes: { [TRACKSY_ATTR.SQL]: validation.sql },
        })

        let finalAnswer = { ...answer, sql: validation.sql }
        let rows: QueryResult[]
        const querySpan = tracer?.span('duckdb', 'query', {
            [TRACKSY_ATTR.SQL]: validation.sql,
        })
        try {
            rows = await queryDBAsJSON<QueryResult>(validation.sql)
            querySpan?.end({
                attributes: { [TRACKSY_ATTR.ROW_COUNT]: rows.length },
            })
        } catch (firstErr) {
            querySpan?.end({ error: describeError(firstErr) })
            // Retry once: feed the error back to the LLM so it can correct the SQL
            const retrySpan = tracer?.span('retry', 'sql-correction', {
                [TRACKSY_ATTR.RETRIED]: true,
            })
            try {
                const retried = await askLLM(
                    routerEngine,
                    `${userText}\n\nPrevious SQL failed with: ${toMessage(firstErr)}`,
                    history,
                    signal
                )
                const retryValidation = validateSql(retried.sql ?? '')
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
                rows = await queryDBAsJSON<QueryResult>(retryValidation.sql)
                retrySpan?.end({
                    attributes: {
                        [TRACKSY_ATTR.SQL]: retryValidation.sql,
                        [TRACKSY_ATTR.ROW_COUNT]: rows.length,
                    },
                })
            } catch (e) {
                retrySpan?.end({ error: describeError(e) })
                // A cancellation during the retry surfaces as an aborted
                // LLMError — hand it to the outer handler so the user sees a
                // clean cancellation, not a misleading SQL error.
                if (e instanceof LLMError && e.kind === 'aborted') {
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
                try {
                    const { askChartConfig } = await import('./askChartConfig')
                    result.chartConfig = await askChartConfig(
                        tracer?.wrapEngine(engine, 'chart') ?? engine,
                        userText,
                        rows
                    )
                } catch (chartErr) {
                    // GenericChartRenderer falls back to inferConfig — no regression
                    // in behaviour, but the degradation is otherwise silent, so
                    // it gets a span of its own rather than vanishing here.
                    tracer?.span('chart-fallback', 'inferConfig').end({
                        status: 'skipped',
                        error: describeError(chartErr),
                    })
                }
            } else if (config.chart === 'off') {
                // Minimal: render the rows verbatim as a table.
                result.chartConfig = { type: 'table' }
            }
            // config.chart === 'infer' → leave undefined; GenericChartRenderer
            // applies the heuristic inferConfig itself.

            if (config.narrative === 'stream') {
                result.streamNarrator = async (onChunk) => {
                    const { askNarrator } = await import('./askNarrator')
                    return askNarrator(
                        tracer?.wrapEngine(engine, 'narrator') ?? engine,
                        userText,
                        rows,
                        onChunk,
                        finalAnswer.explanation
                    )
                }
            }
        }

        return result
    } catch (e) {
        if (e instanceof LLMError && e.kind === 'aborted') {
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
