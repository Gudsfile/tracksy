// Common part of all charts components like StreamPerHour, StreamPerDay, etc.

import { useState, useEffect, useRef, useContext } from 'react'
import { queryDBAsJSON } from '../../../db/queries/queryDB'
import { plot } from '@observablehq/plot'
import { ThemeContext } from '../../../hooks/ThemeContext'

export interface CommonProps<T> {
    query: string
    buildPlot: (data: T[], isDark?: boolean) => ReturnType<typeof plot>
}

export function Common<
    T extends Record<string, string | number | bigint | null>,
>({ query, buildPlot }: CommonProps<T>) {
    const [data, setData] = useState<T[] | undefined>()
    const { effectiveTheme } = useContext(ThemeContext)

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const getData = async () => {
            const result = await queryDBAsJSON<T>(query)
            setData(result)
        }
        getData()
    }, [query])

    useEffect(() => {
        if (!data) return
        const element = buildPlot(data, effectiveTheme === 'dark')
        if (containerRef.current) {
            containerRef.current.appendChild(element)
        }
        return () => {
            element.remove()
        }
    }, [data, buildPlot, effectiveTheme])

    return (
        <div
            ref={containerRef}
            className="p-4 my-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100"
        />
    )
}
