import { useCallback, useEffect, useRef, useState } from 'react'
import { queryDBAsJSON } from '../db/queries/queryDB'
import { validateSql } from '../llm/sqlSafety'
import { isMobileBrowser } from '../llm/deviceDetection'
import type { AssistantPayload, ChatMessage, EngineState } from '../llm/types'

const ASSISTANT_ENABLED_KEY = 'tracksy:assistantEnabled'

function getAssistantEnabled(): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(ASSISTANT_ENABLED_KEY) === 'true'
}

function setAssistantEnabled(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(ASSISTANT_ENABLED_KEY, 'true')
}

export type AskResult = {
    payload: AssistantPayload
    rows?: Record<string, string | number | null>[]
    /**
     * Call after rendering the chart to stream a narrative summary of `rows`.
     * Only attached on capable (non-degraded/desktop) engines — on mobile the
     * UI shows the static explanation instead. Absent when not available.
     */
    streamNarrator?: (onChunk: (delta: string) => void) => Promise<string>
}

export function useChatEngine() {
    const isDegraded = isMobileBrowser()
    const [state, setState] = useState<EngineState>({
        kind: 'idle',
        isDegraded,
    })
    // Holds the dynamically imported module + engine instance so we don't
    // bloat the main bundle with @mlc-ai/web-llm.
    const moduleRef = useRef<typeof import('../llm/engine') | null>(null)
    const askLLMRef = useRef<typeof import('../llm/askLLM') | null>(null)

    const ensureLoaded = useCallback(async () => {
        if (state.kind === 'ready' || state.kind === 'loading') return
        setAssistantEnabled()
        try {
            if (!moduleRef.current) {
                moduleRef.current = await import('../llm/engine')
            }
            if (!askLLMRef.current) {
                askLLMRef.current = await import('../llm/askLLM')
            }
            const { isWebGPUAvailable, getEngine } = moduleRef.current
            if (!isWebGPUAvailable()) {
                setState({
                    kind: 'unsupported',
                    reason: 'WebGPU is not available in this browser. Use Chrome, Edge, or a recent Safari to enable the chat assistant.',
                })
                return
            }
            setState({ kind: 'loading', progress: 0, text: 'Starting…' })
            await getEngine((report) => {
                setState({
                    kind: 'loading',
                    progress: report.progress,
                    text: report.text,
                })
            })
            setState({ kind: 'ready', isDegraded })
        } catch (e) {
            setState({
                kind: 'error',
                error: e instanceof Error ? e.message : String(e),
            })
        }
    }, [state.kind])

    const ask = useCallback(
        async (
            userText: string,
            history: ChatMessage[]
        ): Promise<AskResult> => {
            type QueryResult = Record<string, string | number | null>
            try {
                if (!moduleRef.current || !askLLMRef.current) {
                    return {
                        payload: {
                            kind: 'llm-error',
                            error: 'Assistant engine is not loaded yet.',
                        },
                    }
                }
                const engine = await moduleRef.current.getEngine()
                const answer = await askLLMRef.current.askLLM(
                    engine,
                    userText,
                    history
                )

                // Unified path: every answer's SQL is validated and executed
                // exactly once. The chart, the narrative, and the displayed SQL
                // all read from this single result set, so they cannot disagree.
                const validation = validateSql(answer.sql ?? '')
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
                    rows = await queryDBAsJSON<QueryResult>(validation.sql)
                } catch (firstErr) {
                    // Retry once: feed the error back to the LLM so it can correct the SQL
                    try {
                        const retried = await askLLMRef.current!.askLLM(
                            engine,
                            `${userText}\n\nPrevious SQL failed with: ${firstErr}`,
                            history
                        )
                        const retryValidation = validateSql(retried.sql ?? '')
                        if (!retryValidation.ok) {
                            return {
                                payload: {
                                    kind: 'unsafe-sql',
                                    answer: retried,
                                    reason: retryValidation.reason,
                                },
                            }
                        }
                        finalAnswer = { ...retried, sql: retryValidation.sql }
                        rows = await queryDBAsJSON<QueryResult>(
                            retryValidation.sql
                        )
                    } catch (e) {
                        return {
                            payload: {
                                kind: 'sql-error',
                                answer: finalAnswer,
                                error:
                                    e instanceof Error ? e.message : String(e),
                            },
                        }
                    }
                }

                const result: AskResult = {
                    payload: { kind: 'ok', answer: finalAnswer },
                    rows,
                }

                // Narrative streams only on capable (desktop) engines. The small
                // mobile coder model hallucinates prose, so degraded engines fall
                // back to the static explanation rendered by the UI.
                if (!isDegraded) {
                    result.streamNarrator = async (onChunk) => {
                        const { askNarrator } =
                            await import('../llm/askNarrator')
                        return askNarrator(
                            engine,
                            userText,
                            finalAnswer.sql,
                            rows,
                            onChunk,
                            finalAnswer.explanation
                        )
                    }
                }

                return result
            } catch (e) {
                return {
                    payload: {
                        kind: 'llm-error',
                        error: e instanceof Error ? e.message : String(e),
                    },
                }
            }
        },
        [isDegraded]
    )

    useEffect(() => {
        if (getAssistantEnabled()) ensureLoaded()
    }, [])

    return { state, ensureLoaded, ask }
}
