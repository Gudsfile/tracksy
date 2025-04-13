import { useState, useEffect, useRef } from 'react'
import { queryDB } from '../../../db/queries/queryDB'
import type { Table } from 'apache-arrow'
import { type QueryResult, query } from './query'
import { buildPlot } from './plot'

export function StreamPerMonth() {
    const [data, setData] = useState<Table<QueryResult> | undefined>()

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const getData = async () => {
            const result = await queryDB<QueryResult>(query)
            setData(result)
        }
        getData()
    }, [])

    useEffect(() => {
        let element: ReturnType<typeof buildPlot> | undefined

        if (data !== undefined) {
            element = buildPlot(data)
            containerRef.current?.append(element)
        }
        return () => {
            element?.remove()
        }
    }, [data])

    return data && <div ref={containerRef} />
}
