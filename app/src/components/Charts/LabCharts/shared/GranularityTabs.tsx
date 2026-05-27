import type { Granularity } from './useGranularity'

const GRAN_LABELS: Record<Granularity, string> = {
    year: 'Year',
    month: 'Month',
    week: 'Week',
    day: 'Day',
}

type Props = {
    value: Granularity
    available: Granularity[]
    onChange: (g: Granularity) => void
}

export function GranularityTabs({ value, available, onChange }: Props) {
    return (
        <div className="flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30 self-start mb-3">
            {(['year', 'month', 'week', 'day'] as const).map((g) => {
                const isAvailable = available.includes(g)
                const isActive = value === g
                return (
                    <button
                        key={g}
                        onClick={() => isAvailable && onChange(g)}
                        disabled={!isAvailable}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                            isActive
                                ? 'bg-blue-500 text-white shadow-sm'
                                : isAvailable
                                  ? 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        {GRAN_LABELS[g]}
                    </button>
                )
            })}
        </div>
    )
}
