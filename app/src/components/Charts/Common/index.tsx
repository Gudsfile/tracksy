// Common part of all charts components like StreamPerHour, StreamPerDay, etc.

import { useState, useEffect, useRef, useContext } from 'react'
import { queryDB } from '../../../db/queries/queryDB'
import type { Table, TypeMap } from 'apache-arrow'
import { plot } from '@observablehq/plot'
import { ThemeContext } from '../../../hooks/ThemeContext'

export interface CommonProps<T extends TypeMap> {
    query: string
    buildPlot: (data: Table<T>, isDark?: boolean) => ReturnType<typeof plot>
}

export function Common<T extends TypeMap>({
    query,
    buildPlot,
}: CommonProps<T>) {
    const [data, setData] = useState<Table<T> | undefined>()
    const { effectiveTheme } = useContext(ThemeContext)

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const getData = async () => {
            const result = await queryDB<T>(query)
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
