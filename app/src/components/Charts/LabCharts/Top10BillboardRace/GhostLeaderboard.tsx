export type GhostEntry = {
    label: string
    periodsInTop10: number
    rankDelta: number | null
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
                        <span className="text-xs font-mono shrink-0 w-8 text-right">
                            {entry.rankDelta === null ? (
                                <span className="text-blue-400">new</span>
                            ) : entry.rankDelta > 0 ? (
                                <span className="text-emerald-400">
                                    ↑{entry.rankDelta}
                                </span>
                            ) : entry.rankDelta < 0 ? (
                                <span className="text-red-400">
                                    ↓{Math.abs(entry.rankDelta)}
                                </span>
                            ) : (
                                <span className="text-gray-400 opacity-40">
                                    —
                                </span>
                            )}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
