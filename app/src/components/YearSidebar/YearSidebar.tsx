import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface YearSidebarProps {
    value: number | undefined
    onChange: (value: number | undefined) => void
    min: number
    max: number
}

const FLOATING_BREAKPOINT = '(min-width: 1280px)'

const BASE_BUTTON =
    'shrink-0 px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-200'
const ACTIVE_BUTTON = 'bg-gradient-brand text-white shadow-glow'
const INACTIVE_BUTTON =
    'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-200'

function readFloatingMatch(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(FLOATING_BREAKPOINT).matches
}

export function YearSidebar({ value, onChange, min, max }: YearSidebarProps) {
    const [isFloating, setIsFloating] = useState(readFloatingMatch)

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return
        const mq = window.matchMedia(FLOATING_BREAKPOINT)
        const update = () => setIsFloating(mq.matches)
        update()
        mq.addEventListener('change', update)
        return () => mq.removeEventListener('change', update)
    }, [])

    const years: number[] = []
    for (let year = max; year >= min; year--) years.push(year)

    const sidebar = (
        <aside
            className={
                isFloating
                    ? 'fixed top-24 left-8 z-40 w-32 max-h-[calc(100vh-7rem)]'
                    : 'sticky top-2 z-40 mb-4'
            }
        >
            <nav
                aria-label="Filter by year"
                className={`flex gap-2 rounded-2xl border border-gray-300/60 bg-white/70 p-2 shadow-lg backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/70 ${
                    isFloating
                        ? 'flex-col overflow-y-auto'
                        : 'flex-row overflow-x-auto'
                }`}
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

    // When floating, portal to body to escape any transformed ancestor that
    // would otherwise capture a `fixed` descendant as its containing block
    // (e.g. the animate-slide-up wrapper around the Results panel).
    if (isFloating && typeof document !== 'undefined') {
        return createPortal(sidebar, document.body)
    }

    return sidebar
}
