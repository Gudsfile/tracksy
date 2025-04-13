// Common part of all charts components like StreamPerHour, StreamPerDay, etc.

import { useState, useEffect, useRef } from 'react'
import { queryDB } from '../../../db/queries/queryDB'
import type { Table, TypeMap } from 'apache-arrow'
import { plot } from '@observablehq/plot'

export interface CommonProps<T extends TypeMap> {
    query: string
    buildPlot:
        | ((data: Table<T>) => ReturnType<typeof plot>)
        | ((data: undefined) => undefined)
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
        let element: ReturnType<typeof plot> | undefined

        if (data !== undefined && buildPlot !== undefined) {
            element = buildPlot(data)
            if (!element) return
            containerRef.current?.append(element)
        }
        return () => {
            element?.remove()
        }
    }, [data, buildPlot])

    return data ? <div ref={containerRef} /> : null
}
