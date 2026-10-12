// Common part of all charts components like StreamPerHour, StreamPerDay, etc.

import { useEffect, useRef, useContext } from 'react'
import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { ThemeContext } from '../../../../hooks/ThemeContext'
import { ChartCardEmpty } from '../../SimpleCharts/shared/ChartCardEmpty'

const cardClassName =
    'group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in'

export interface CommonProps<T> {
    query: string
    buildPlot: (data: T[], isDark?: boolean) => Element
}

export function Common<T extends Record<string, string | number | null>>({
    query,
    buildPlot,
}: CommonProps<T>) {
    const { data, error } = useDBQueryMany<T>({ query })
    const { effectiveTheme } = useContext(ThemeContext)

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!data) return
        const element = buildPlot(data, effectiveTheme === 'dark')
        if (containerRef.current) {
            containerRef.current.replaceChildren(element)
        }
        return () => {
            element.remove()
        }
    }, [data, buildPlot, effectiveTheme])

    if (error) {
        return (
            <div className={cardClassName}>
                <ChartCardEmpty message={error.message} />
            </div>
        )
    }

    return (
        <div ref={containerRef} className={cardClassName}>
            {!data && <ChartCardEmpty />}
        </div>
    )
}
