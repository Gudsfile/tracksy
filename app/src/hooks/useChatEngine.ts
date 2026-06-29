import { useCallback, useEffect, useRef, useState } from 'react'
import { queryDBAsJSON } from '../db/queries/queryDB'
import { validateSql } from '../llm/sqlSafety'
import { isMobileBrowser } from '../llm/deviceDetection'
import {
    LLMError,
    type AssistantPayload,
    type ChatMessage,
    type EngineState,
} from '../llm/types'

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
    const abortRef = useRef<AbortController | null>(null)

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
            try {
                if (!moduleRef.current || !askLLMRef.current) {
                    return {
                        payload: {
                            kind: 'llm-error',
                            error: 'Assistant engine is not loaded yet.',
                        },
                    }
                }
                abortRef.current = new AbortController()
                const engine = await moduleRef.current.getEngine()
                const answer = await askLLMRef.current.askLLM(
                    engine,
                    userText,
                    history,
                    abortRef.current.signal
                )

                if (answer.intent !== 'custom') {
                    return { payload: { kind: 'ok', answer } }
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
                try {
                    const rows = await queryDBAsJSON<
                        Record<string, string | number | null>
                    >(validation.sql)
                    return {
                        payload: {
                            kind: 'ok',
                            answer: { ...answer, sql: validation.sql },
                        },
                        rows,
                    }
                } catch (e) {
                    return {
                        payload: {
                            kind: 'sql-error',
                            answer: { ...answer, sql: validation.sql },
                            error: e instanceof Error ? e.message : String(e),
                        },
                    }
                }
            } catch (e) {
                if (e instanceof LLMError && e.kind === 'aborted') {
                    return { payload: { kind: 'aborted' } }
                }
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

    const cancel = useCallback(() => {
        abortRef.current?.abort()
    }, [])

    useEffect(() => {
        if (getAssistantEnabled()) ensureLoaded()
    }, [])

    return { state, ensureLoaded, ask, cancel }
}
