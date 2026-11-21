// Type-only, so nothing is pulled into the bundle. `webllm-otel` is a
// devDependency and the runtime import lives solely in `llm/tracing.ts`.
import type { Span } from 'webllm-otel'
// From the leaf `llm/evals/types` module, never `score` or `store`: those reach
// the pipeline, which reaches `queryDB`, which imports this very file — a real
// import cycle that dependency-cruiser flags.
import type { CaseResult as EvalCaseResult, EvalRun } from '../llm/evals/types'

type DevBusEventMap = {
    'duckdb:query': {
        sql: string
        durationMs: number
        rowCount: number
        source?: string
        error?: string
    }
    'webllm:load': { model: string; progress: number; text: string }
    /**
     * A closed span from the assistant pipeline — one per step of a turn,
     * correlated by `traceId`. This replaces the old `webllm:inference` event,
     * which reported the three agents identically and kept only the last.
     */
    'agent:span': { span: Span }
    'stream:parsed': {
        provider: string
        recordCount: number
        durationMs: number
    }

    // --- Eval runner ---
    //
    // The bus carries commands as well as observations. The toolbar cannot run
    // evals itself: it lives in a separate module graph, so importing the engine
    // there would build a *second* one and download the model twice. Instead the
    // toolbar asks, and a dev-only island in the page — which shares the engine
    // singleton with the chat — answers.
    'eval:run': {
        /** Omit to run the whole suite. */
        caseIds?: string[]
        includeChart: boolean
        includeNarrator: boolean
    }
    'eval:cancel': Record<string, never>
    'eval:load-demo': Record<string, never>
    /** Progress and lifecycle, so the toolbar can stream results as they land. */
    'eval:status': {
        state: 'idle' | 'loading-demo' | 'running' | 'done' | 'error'
        message?: string
        completed?: number
        total?: number
        /** Human-readable summary of the loaded dataset. */
        dataset?: string
    }
    'eval:case': { result: EvalCaseResult; spans: Span[] }
    'eval:done': { run: EvalRun }
}

const PREFIX = 'tracksy:dev:'

export const devBus = {
    emit<K extends keyof DevBusEventMap>(
        type: K,
        detail: DevBusEventMap[K]
    ): void {
        if (!import.meta.env.DEV || typeof window === 'undefined') return
        window.dispatchEvent(new CustomEvent(PREFIX + type, { detail }))
    },
    on<K extends keyof DevBusEventMap>(
        type: K,
        cb: (d: DevBusEventMap[K]) => void
    ): () => void {
        const handler = (e: Event) =>
            cb((e as CustomEvent<DevBusEventMap[K]>).detail)
        window.addEventListener(PREFIX + type, handler)
        return () => window.removeEventListener(PREFIX + type, handler)
    },
}

export type { DevBusEventMap }
