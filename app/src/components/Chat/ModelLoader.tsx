import type { EngineState } from '../../llm/types'

type ModelLoaderProps = {
    state: EngineState
    onEnable: () => void
}

function DegradedNotice() {
    return (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/40 text-amber-800 dark:text-amber-300 text-sm">
            <span className="shrink-0">⚠️</span>
            <p>
                A lighter model is used on this device. Responses may be less
                accurate — especially for time-based questions.
            </p>
        </div>
    )
}

export function ModelLoader({ state, onEnable }: ModelLoaderProps) {
    if (state.kind === 'ready') {
        return state.isDegraded ? <DegradedNotice /> : null
    }

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
                time you enable it, it will download about{' '}
                {state.isDegraded ? '~950 MB' : '~1 GB'} of model weights;
                afterwards everything works offline.
            </p>
            {state.isDegraded && (
                <div className="mb-4">
                    <DegradedNotice />
                </div>
            )}
            <button
                onClick={onEnable}
                className="px-4 py-2 bg-gradient-brand text-white font-semibold rounded-xl shadow-glow transition-all"
            >
                Enable assistant
            </button>
        </div>
    )
}
