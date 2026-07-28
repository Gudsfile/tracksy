import { SHORTCUTS, SUGGESTION_EMOJI } from '../../llm/shortcuts'
import type { Suggestion } from '../../llm/types'

type ChatShortcutsProps = {
    onSelect: (question: string) => void
    disabled?: boolean
    /**
     * Model-generated chips reflecting what the user is typing. When empty —
     * no draft, suggestions turned off, or a failed run — the built-in
     * `SHORTCUTS` are shown instead, so the row is never blank.
     */
    suggestions?: Suggestion[]
    /** Dim the row while a fresh set is being generated. */
    isGenerating?: boolean
}

export function ChatShortcuts({
    onSelect,
    disabled,
    suggestions,
    isGenerating,
}: ChatShortcutsProps) {
    const generated = suggestions !== undefined && suggestions.length > 0
    const chips: (Suggestion & { emoji: string })[] = generated
        ? suggestions.map((s) => ({ ...s, emoji: SUGGESTION_EMOJI }))
        : SHORTCUTS

    return (
        <>
            {/*
             * A summary rather than `aria-live` on the row itself: a live
             * region wrapping the buttons re-announces all four chips on every
             * typing pause, which is unusable while composing a question.
             */}
            <p className="sr-only" role="status">
                {generated
                    ? `${chips.length} suggestions for what you're typing`
                    : ''}
            </p>
            <div
                className={`flex gap-2 overflow-x-auto pb-1 md:flex-wrap scrollbar-none transition-opacity duration-200 ${
                    isGenerating ? 'opacity-60' : 'opacity-100'
                }`}
            >
                {chips.map((s) => (
                    <button
                        key={s.question}
                        type="button"
                        disabled={disabled}
                        onClick={() => onSelect(s.question)}
                        title={s.question}
                        className="flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/50 backdrop-blur-md border border-gray-300/60 dark:border-slate-700/50 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-400/60 dark:hover:border-slate-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
                    >
                        <span aria-hidden="true">{s.emoji}</span>
                        <span>{s.label}</span>
                    </button>
                ))}
            </div>
        </>
    )
}
