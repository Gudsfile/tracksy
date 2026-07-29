import { useCallback, useEffect, useRef, useState } from 'react'
import { queryDBAsJSON } from '../db/queries/queryDB'
import { validateSql } from '../llm/sqlSafety'
import {
    getStoredConfig,
    saveConfig,
    MODEL_LARGE,
    type AssistantConfig,
} from '../llm/assistantConfig'
import {
    LLMError,
    type AssistantPayload,
    type ChatMessage,
    type EngineState,
} from '../llm/types'
import type { ChartConfig } from '../llm/askChartConfig'

const ASSISTANT_ENABLED_KEY = 'tracksy:assistantEnabled'

const toMessage = (e: unknown): string =>
    e instanceof Error ? e.message : String(e)

function getAssistantEnabled(): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(ASSISTANT_ENABLED_KEY) === 'true'
}

function setAssistantEnabled(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(ASSISTANT_ENABLED_KEY, 'true')
}

/**
 * Any model other than the default full model may give lower-quality answers
 * (a lighter built-in model, or a custom/unverified model chosen in Advanced) —
 * surfaced via a notice.
 */
function isDegradedConfig(config: AssistantConfig): boolean {
    return config.modelId !== MODEL_LARGE
}

export type AskResult = {
    payload: AssistantPayload
    rows?: Record<string, string | number | null>[]
    chartConfig?: ChartConfig
    /**
     * Call after rendering the chart to stream a narrative summary of `rows`.
     * Only attached when the active config's narrative mode is `stream`;
     * otherwise the UI shows the static explanation. Absent when not available.
     */
    streamNarrator?: (onChunk: (delta: string) => void) => Promise<string>
}

export function useChatEngine() {
    const [config, setConfig] = useState<AssistantConfig | null>(
        getStoredConfig
    )
    const [state, setState] = useState<EngineState>({
        kind: 'idle',
        isDegraded: false,
    })
    // Holds the dynamically imported module + engine instance so we don't
    // bloat the main bundle with @mlc-ai/web-llm.
    const moduleRef = useRef<typeof import('../llm/engine') | null>(null)
    const askLLMRef = useRef<typeof import('../llm/askLLM') | null>(null)
    const abortRef = useRef<AbortController | null>(null)
    // Latest config + the model actually loaded into the engine, read inside
    // callbacks without adding React deps.
    const configRef = useRef<AssistantConfig | null>(config)
    const loadedModelRef = useRef<string | null>(null)

    useEffect(() => {
        configRef.current = config
    }, [config])

    const loadModules = useCallback(async () => {
        if (!moduleRef.current) {
            moduleRef.current = await import('../llm/engine')
        }
        if (!askLLMRef.current) {
            askLLMRef.current = await import('../llm/askLLM')
        }
        return moduleRef.current
    }, [])

    const loadWith = useCallback(
        async (cfg: AssistantConfig) => {
            setAssistantEnabled()
            try {
                const { isWebGPUAvailable, getEngine } = await loadModules()
                if (!isWebGPUAvailable()) {
                    setState({
                        kind: 'unsupported',
                        reason: 'WebGPU is not available in this browser. Use Chrome, Edge, or a recent Safari to enable the chat assistant.',
                    })
                    return
                }
                setState({ kind: 'loading', progress: 0, text: 'Starting…' })
                await getEngine(cfg.modelId, (report) => {
                    setState({
                        kind: 'loading',
                        progress: report.progress,
                        text: report.text,
                    })
                })
                loadedModelRef.current = cfg.modelId
                setState({ kind: 'ready', isDegraded: isDegradedConfig(cfg) })
            } catch (e) {
                setState({
                    kind: 'error',
                    error: toMessage(e),
                })
            }
        },
        [loadModules]
    )

    // Load using the current/stored config. No-op until the user has chosen one
    // (the onboarding picker supplies it via `enableWith`).
    const ensureLoaded = useCallback(async () => {
        if (state.kind === 'ready' || state.kind === 'loading') return
        const cfg = configRef.current ?? getStoredConfig()
        if (!cfg) return
        await loadWith(cfg)
    }, [state.kind, loadWith])

    // First-time enable from the onboarding picker: persist the choice, then load.
    const enableWith = useCallback(
        async (cfg: AssistantConfig) => {
            saveConfig(cfg)
            configRef.current = cfg
            setConfig(cfg)
            await loadWith(cfg)
        },
        [loadWith]
    )

    // Apply a config change from the settings panel. Agent-toggle changes take
    // effect on the next question with no reload; a model change unloads the
    // engine and re-downloads the new weights.
    const applyConfig = useCallback(async (cfg: AssistantConfig) => {
        saveConfig(cfg)
        const prevModel = loadedModelRef.current
        configRef.current = cfg
        setConfig(cfg)

        if (!prevModel || prevModel === cfg.modelId || !moduleRef.current) {
            // No model swap needed — new axes are read on the next `ask`.
            setState((prev) =>
                prev.kind === 'ready'
                    ? { kind: 'ready', isDegraded: isDegradedConfig(cfg) }
                    : prev
            )
            return
        }

        setState({ kind: 'loading', progress: 0, text: 'Switching model…' })
        try {
            // getEngine tears down the previous model and loads the new one
            // atomically when the requested modelId differs.
            await moduleRef.current.getEngine(cfg.modelId, (report) => {
                setState({
                    kind: 'loading',
                    progress: report.progress,
                    text: report.text,
                })
            })
            loadedModelRef.current = cfg.modelId
            setState({ kind: 'ready', isDegraded: isDegradedConfig(cfg) })
        } catch (e) {
            setState({
                kind: 'error',
                error: toMessage(e),
            })
        }
    }, [])

    const ask = useCallback(
        async (
            userText: string,
            history: ChatMessage[]
        ): Promise<AskResult> => {
            type QueryResult = Record<string, string | number | null>
            const cfg = configRef.current
            try {
                if (!moduleRef.current || !askLLMRef.current || !cfg) {
                    return {
                        payload: {
                            kind: 'llm-error',
                            error: 'Assistant engine is not loaded yet.',
                        },
                    }
                }
                abortRef.current = new AbortController()
                const signal = abortRef.current.signal
                const engine = await moduleRef.current.getEngine(cfg.modelId)
                const answer = await askLLMRef.current.askLLM(
                    engine,
                    userText,
                    history,
                    signal
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
                            `${userText}\n\nPrevious SQL failed with: ${toMessage(firstErr)}`,
                            history,
                            signal
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
                        // A cancellation during the retry surfaces as an aborted
                        // LLMError — hand it to the outer handler so the user
                        // sees a clean cancellation, not a misleading SQL error.
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
                    if (cfg.chart === 'llm') {
                        try {
                            const { askChartConfig } =
                                await import('../llm/askChartConfig')
                            result.chartConfig = await askChartConfig(
                                engine,
                                userText,
                                rows
                            )
                        } catch {
                            // GenericChartRenderer falls back to inferConfig — no regression
                        }
                    } else if (cfg.chart === 'off') {
                        // Minimal: render the rows verbatim as a table.
                        result.chartConfig = { type: 'table' }
                    }
                    // cfg.chart === 'infer' → leave undefined; GenericChartRenderer
                    // applies the heuristic inferConfig itself.

                    if (cfg.narrative === 'stream') {
                        result.streamNarrator = async (onChunk) => {
                            const { askNarrator } =
                                await import('../llm/askNarrator')
                            return askNarrator(
                                engine,
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
        },
        []
    )

    const cancel = useCallback(() => {
        abortRef.current?.abort()
    }, [])

    useEffect(() => {
        // Auto-load only when the user has both enabled the assistant and
        // already chosen a config. Enabled-but-no-config (pre-feature users)
        // falls through to the onboarding picker exactly once.
        const cfg = getStoredConfig()
        if (cfg && getAssistantEnabled()) {
            configRef.current = cfg
            setConfig(cfg)
            loadWith(cfg)
        }
    }, [loadWith])

    return {
        state,
        config,
        ensureLoaded,
        enableWith,
        applyConfig,
        ask,
        cancel,
    }
}
