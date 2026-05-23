type DevBusEventMap = {
    'duckdb:query': {
        sql: string
        durationMs: number
        rowCount: number
        error?: string
    }
    'webllm:load': { model: string; progress: number; text: string }
    'webllm:inference': {
        model: string
        durationMs: number
        tokensPerSec: number
    }
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
