// Common part of all charts components like StreamPerHour, StreamPerDay, etc.

import { useState, useEffect, useRef, useContext } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { plot } from '@observablehq/plot'
import { ThemeContext } from '../../../../hooks/ThemeContext'

export interface CommonProps<T> {
    query: string
    params?: unknown[]
    buildPlot: (data: T[], isDark?: boolean) => ReturnType<typeof plot>
}

export function Common<T extends Record<string, string | number | null>>({
    query,
    params,
    buildPlot,
}: CommonProps<T>) {
    const [data, setData] = useState<T[] | undefined>()
    const { effectiveTheme } = useContext(ThemeContext)

    const containerRef = useRef<HTMLDivElement>(null)

    // Use a stable key for params to avoid re-running on every render
    // (array identity changes on every render even if values are the same)
    const paramsKey = JSON.stringify(params ?? [])
    useEffect(() => {
        const getData = async () => {
            const result = await queryDBAsJSON<T>(query, params)
            setData(result)
        }
        getData()
    }, [query, paramsKey])

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

    return (
        <div
            ref={containerRef}
            className="group p-6 my-4 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in"
        />
    )
}
