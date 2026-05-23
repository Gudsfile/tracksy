type Shortcut = { emoji: string; label: string; question: string }

const SHORTCUTS: Shortcut[] = [
    {
        emoji: '🎵',
        label: 'Top artists',
        question: 'Who are my top 5 most listened to artists?',
    },
    {
        emoji: '🌙',
        label: 'Late night',
        question: 'What do I listen to after midnight?',
    },
    {
        emoji: '☀️',
        label: 'Season trends',
        question: 'How does my listening change by season?',
    },
    {
        emoji: '🔁',
        label: 'Most replayed',
        question: 'What is my most replayed track?',
    },
    {
        emoji: '📅',
        label: 'Peak day',
        question: 'Which day of the week do I listen most?',
    },
    {
        emoji: '🆕',
        label: 'Discovery',
        question: 'Which artists did I discover this year?',
    },
]

type ChatShortcutsProps = {
    onSelect: (question: string) => void
    disabled?: boolean
}

export function ChatShortcuts({ onSelect, disabled }: ChatShortcutsProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap scrollbar-none">
            {SHORTCUTS.map((s) => (
                <button
                    key={s.label}
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(s.question)}
                    className="flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/50 backdrop-blur-md border border-gray-300/60 dark:border-slate-700/50 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-400/60 dark:hover:border-slate-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
                >
                    <span aria-hidden="true">{s.emoji}</span>
                    <span>{s.label}</span>
                </button>
            ))}
        </div>
    )
}
