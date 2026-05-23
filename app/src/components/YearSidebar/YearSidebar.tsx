interface YearSidebarProps {
    value: number | undefined
    onChange: (value: number | undefined) => void
    min: number
    max: number
}

const BASE_BUTTON =
    'shrink-0 px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-200'
const ACTIVE_BUTTON = 'bg-gradient-brand text-white shadow-glow'
const INACTIVE_BUTTON =
    'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-200'

export function YearSidebar({ value, onChange, min, max }: YearSidebarProps) {
    const years: number[] = []
    for (let year = max; year >= min; year--) years.push(year)

    return (
        <aside className="sticky top-2 z-40 mb-4 xl:fixed xl:top-24 xl:left-8 xl:mb-0 xl:w-32 xl:max-h-[calc(100vh-7rem)]">
            <nav
                aria-label="Filter by year"
                className="flex flex-row gap-2 overflow-x-auto rounded-2xl border border-gray-300/60 bg-white/70 p-2 shadow-lg backdrop-blur-md xl:flex-col xl:overflow-x-visible xl:overflow-y-auto dark:border-slate-700/50 dark:bg-slate-900/70"
            >
                <button
                    type="button"
                    aria-pressed={value === undefined}
                    onClick={() => onChange(undefined)}
                    className={`${BASE_BUTTON} ${
                        value === undefined ? ACTIVE_BUTTON : INACTIVE_BUTTON
                    }`}
                >
                    All time
                </button>
                {years.map((year) => (
                    <button
                        key={year}
                        type="button"
                        aria-pressed={value === year}
                        onClick={() => onChange(year)}
                        className={`${BASE_BUTTON} ${
                            value === year ? ACTIVE_BUTTON : INACTIVE_BUTTON
                        }`}
                    >
                        {year}
                    </button>
                ))}
            </nav>
        </aside>
    )
}
