// Common part of all charts components like StreamPerHour, StreamPerDay, etc.

import { useState, useEffect, useRef } from 'react'
import { queryDB } from '../../../db/queries/queryDB'
import type { Table, TypeMap } from 'apache-arrow'
import { plot } from '@observablehq/plot'

export interface CommonProps<T extends TypeMap> {
    query: string
    buildPlot: (
        data: Table<T> | undefined
    ) => ReturnType<typeof plot> | undefined
}

export function Common<T extends TypeMap>({
    query,
    buildPlot,
}: CommonProps<T>) {
    const [data, setData] = useState<Table<T> | undefined>()

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const getData = async () => {
            const result = await queryDB<T>(query)
            setData(result)
        }
        getData()
    }, [query])

    useEffect(() => {
        const element = buildPlot?.(data)
        if (element && containerRef.current) {
            containerRef.current.appendChild(element)
        }
        return () => {
            element?.remove()
        }
    }, [data, buildPlot])

    return <div ref={containerRef} />
}
