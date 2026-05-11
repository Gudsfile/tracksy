import type { EngineState } from '../../llm/types'

type ModelLoaderProps = {
    state: EngineState
    onEnable: () => void
}

export function ModelLoader({ state, onEnable }: ModelLoaderProps) {
    if (state.kind === 'ready') return null

    if (state.kind === 'unsupported') {
        return (
            <div className="p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-amber-300/60 dark:border-amber-700/50 text-gray-900 dark:text-gray-100">
                <h3 className="text-lg font-semibold mb-2">
                    🚫 Browser not supported
                </h3>
                <p className="text-sm">{state.reason}</p>
            </div>
        )
    }

    if (state.kind === 'error') {
        return (
            <div className="p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-red-300/60 dark:border-red-700/50 text-gray-900 dark:text-gray-100">
                <h3 className="text-lg font-semibold mb-2">
                    ⚠️ Failed to load assistant
                </h3>
                <p className="text-sm mb-4 break-all">{state.error}</p>
                <button
                    onClick={onEnable}
                    className="px-4 py-2 bg-gradient-brand text-white font-semibold rounded-xl shadow-glow"
                >
                    Retry
                </button>
            </div>
        )
    }

    if (state.kind === 'loading') {
        const pct = Math.round(state.progress * 100)
        return (
            <div className="p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100">
                <h3 className="text-lg font-semibold mb-2">
                    ⏳ Loading assistant…
                </h3>
                <p className="text-sm mb-3 text-gray-600 dark:text-gray-400">
                    {state.text}
                </p>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-gradient-brand h-2 transition-all duration-200"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <p className="text-xs mt-2 text-gray-500 dark:text-gray-500">
                    {pct}% — runs entirely in your browser, weights are cached
                    after first load.
                </p>
            </div>
        )
    }

    // idle
    return (
        <div className="p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-semibold mb-2">
                💬 Local chat assistant
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Ask questions about your listening history in plain English. The
                assistant runs locally in your browser using WebLLM. The first
                time you enable it, it will download about 1&nbsp;GB of model
                weights; afterwards everything works offline.
            </p>
            <button
                onClick={onEnable}
                className="px-4 py-2 bg-gradient-brand text-white font-semibold rounded-xl shadow-glow transition-all"
            >
                Enable assistant
            </button>
        </div>
    )
}
