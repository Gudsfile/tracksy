import { useCallback, useEffect, useRef, useState } from 'react'
import {
    getStoredConfig,
    saveConfig,
    MODEL_LARGE,
    type AssistantConfig,
} from '../llm/assistantConfig'
import {
    runAssistantTurn,
    toMessage,
    type AskResult,
} from '../llm/runAssistantTurn'
import { TRACKSY_ATTR, type TurnTracer } from '../llm/tracingTypes'
import type { ChatMessage, EngineState } from '../llm/types'

/**
 * The dev-only tracing module, or undefined in production. Vite replaces
 * `import.meta.env.DEV` with `false` in a build, so Rollup drops the dynamic
 * import and `webllm-otel` never enters the production graph. See
 * `llm/tracingTypes`; `moon run app:assert-no-dev-code` enforces it.
 */
const devTracing = () =>
    import.meta.env.DEV ? import('../llm/tracing') : Promise.resolve(undefined)

const newSessionId = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const ASSISTANT_ENABLED_KEY = 'tracksy:assistantEnabled'

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

// Re-exported so existing importers (and tests) keep their import path; the type
// itself now belongs with the pipeline in `llm/runAssistantTurn`.
export type { AskResult }

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
    const abortRef = useRef<AbortController | null>(null)
    // Latest config + the model actually loaded into the engine, read inside
    // callbacks without adding React deps.
    const configRef = useRef<AssistantConfig | null>(config)
    const loadedModelRef = useRef<string | null>(null)
    // Groups the traced turns of one conversation; renewed when a question
    // arrives with no history, i.e. a new conversation.
    const sessionIdRef = useRef<string>(newSessionId())

    useEffect(() => {
        configRef.current = config
    }, [config])

    const loadModules = useCallback(async () => {
        if (!moduleRef.current) {
            moduleRef.current = await import('../llm/engine')
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
                const loadTrace = (await devTracing())?.traceModelLoad({
                    modelId: cfg.modelId,
                    reason: 'initial',
                    sessionId: sessionIdRef.current,
                })
                try {
                    await getEngine(cfg.modelId, (report) => {
                        setState({
                            kind: 'loading',
                            progress: report.progress,
                            text: report.text,
                        })
                    })
                    loadTrace?.end()
                } catch (e) {
                    loadTrace?.end({ message: toMessage(e) })
                    throw e
                }
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

        // A turn still generating on the old model would be cut off by the
        // unload mid-call; cancel it cleanly first.
        abortRef.current?.abort()
        setState({ kind: 'loading', progress: 0, text: 'Switching model…' })
        const loadTrace = (await devTracing())?.traceModelLoad({
            modelId: cfg.modelId,
            reason: 'switch',
            sessionId: sessionIdRef.current,
        })
        try {
            // getEngine tears down the previous model and loads the new one
            // when the requested modelId differs. Calls are serialized, so a
            // question asked meanwhile waits for the switch instead of racing it.
            await moduleRef.current.getEngine(cfg.modelId, (report) => {
                setState({
                    kind: 'loading',
                    progress: report.progress,
                    text: report.text,
                })
            })
            loadTrace?.end()
            loadedModelRef.current = cfg.modelId
            setState({ kind: 'ready', isDegraded: isDegradedConfig(cfg) })
        } catch (e) {
            loadTrace?.end({ message: toMessage(e) })
            setState({
                kind: 'error',
                error: toMessage(e),
            })
        }
    }, [])

    // Resolving the engine and owning the abort controller are this hook's job;
    // everything the turn actually does lives in `runAssistantTurn`, so the dev
    // eval runner can execute the identical code path without React.
    const ask = useCallback(
        async (
            userText: string,
            history: ChatMessage[]
        ): Promise<AskResult> => {
            const cfg = configRef.current
            if (!moduleRef.current || !cfg) {
                return {
                    payload: {
                        kind: 'llm-error',
                        error: 'Assistant engine is not loaded yet.',
                    },
                }
            }

            abortRef.current = new AbortController()
            if (history.length === 0) sessionIdRef.current = newSessionId()

            // Opened before the engine is resolved, so a turn that has to wait
            // for a model load counts that wait: it is what the user sat through.
            const tracer: TurnTracer | undefined = (
                await devTracing()
            )?.createTurnTracer({
                question: userText,
                modelId: cfg.modelId,
                sessionId: sessionIdRef.current,
                environment: 'dev',
                attributes: {
                    [TRACKSY_ATTR.CHART_MODE]: cfg.chart,
                    [TRACKSY_ATTR.NARRATIVE_MODE]: cfg.narrative,
                },
            })

            const ready = moduleRef.current.isEngineReady(cfg.modelId)
            const loadSpan = ready
                ? undefined
                : tracer?.span('model-load', 'model-load', {
                      [TRACKSY_ATTR.MODEL_ID]: cfg.modelId,
                  })
            tracer?.setAttributes({ [TRACKSY_ATTR.ENGINE_REUSED]: ready })
            let engine
            try {
                engine = await moduleRef.current.getEngine(cfg.modelId)
                loadSpan?.end()
            } catch (e) {
                const payload = {
                    kind: 'llm-error' as const,
                    error: toMessage(e),
                }
                loadSpan?.end({ error: { message: payload.error } })
                tracer?.end({
                    error: { kind: payload.kind, message: payload.error },
                    attributes: { [TRACKSY_ATTR.PAYLOAD_KIND]: payload.kind },
                })
                return { payload }
            }

            // runAssistantTurn closes the trace itself: after the narrator when
            // one streams, so the root span covers the whole turn.
            return runAssistantTurn(
                engine,
                cfg,
                userText,
                history,
                abortRef.current.signal,
                tracer
            )
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
