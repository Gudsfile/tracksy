import { useCallback, useRef, useState } from 'react'
import { queryDBAsJSON } from '../db/queries/queryDB'
import { validateSql } from '../llm/sqlSafety'
import { isMobileBrowser } from '../llm/deviceDetection'
import type { AssistantPayload, ChatMessage, EngineState } from '../llm/types'

export type AskResult = {
    payload: AssistantPayload
    rows?: Record<string, string | number | null>[]
    /** Call after rendering the chart to stream a narrative summary. Present for all successful queries. */
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

                if (answer.intent !== 'custom') {
                    const capturedEngine = engine
                    const capturedAnswer = answer
                    const capturedQuestion = userText
                    return {
                        payload: { kind: 'ok', answer },
                        streamNarrator: async (onChunk) => {
                            const { askNarrator } =
                                await import('../llm/askNarrator')
                            return askNarrator(
                                capturedEngine,
                                capturedQuestion,
                                capturedAnswer.sql,
                                [],
                                onChunk,
                                capturedAnswer.explanation
                            )
                        },
                    }
                }

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
                let rows: Record<string, string | number | null>[]
                try {
                    rows = await queryDBAsJSON<
                        Record<string, string | number | null>
                    >(validation.sql)
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
                        rows = await queryDBAsJSON<
                            Record<string, string | number | null>
                        >(retryValidation.sql)
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

                const capturedEngine = engine
                const capturedQuestion = userText
                const capturedSql = finalAnswer.sql
                const capturedRows = rows

                return {
                    payload: { kind: 'ok', answer: finalAnswer },
                    rows,
                    streamNarrator: async (onChunk) => {
                        const { askNarrator } =
                            await import('../llm/askNarrator')
                        return askNarrator(
                            capturedEngine,
                            capturedQuestion,
                            capturedSql,
                            capturedRows,
                            onChunk
                        )
                    },
                }
            } catch (e) {
                return {
                    payload: {
                        kind: 'llm-error',
                        error: e instanceof Error ? e.message : String(e),
                    },
                }
            }
        },
        []
    )

    return { state, ensureLoaded, ask }
}
