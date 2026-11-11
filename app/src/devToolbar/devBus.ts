// Type-only, so nothing is pulled into the bundle. `webllm-otel` is a
// devDependency and the runtime import lives solely in `llm/tracing.ts`.
import type { Span } from 'webllm-otel'

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
