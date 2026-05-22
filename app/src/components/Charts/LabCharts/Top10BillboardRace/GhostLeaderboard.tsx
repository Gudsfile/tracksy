type GhostEntry = {
    label: string
    periodsInTop10: number
    streak: number
}

type Props = {
    ranking: GhostEntry[]
    activeLabels: Set<string>
}

export function GhostLeaderboard({ ranking, activeLabels }: Props) {
    return (
        <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                Longevity Leaderboard
            </span>
            <div className="flex flex-col gap-0.5">
                {ranking.map((entry, index) => (
                    <div
                        key={entry.label}
                        className="flex items-center gap-2 py-1 px-1 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                        <span className="text-xs text-gray-400 dark:text-gray-500 w-5 text-right shrink-0 font-mono">
                            {index + 1}
                        </span>
                        <span
                            className={`text-sm truncate flex-1 min-w-0 ${
                                activeLabels.has(entry.label)
                                    ? 'font-bold text-gray-900 dark:text-white'
                                    : 'font-normal text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            {entry.label}
                        </span>
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0">
                            {entry.periodsInTop10}w
                        </span>
                        {entry.streak > 1 ? (
                            <span className="text-xs text-amber-400 shrink-0 w-6 text-right">
                                ↑{entry.streak}
                            </span>
                        ) : (
                            <span className="w-6 shrink-0" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
