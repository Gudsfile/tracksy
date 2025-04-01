import * as Plot from '@observablehq/plot'
import { useState, useEffect, useRef } from 'react'
import { queryDB } from '../../db/queries/queryDB'
import { TABLE } from '../../db/queries/constants'
import type { Table, Float, Date_, Utf8 } from 'apache-arrow'

const query = `
SELECT
  ms_played,
  ts::date as ts,
  username
FROM ${TABLE}
order by ts
`

type QueryResult = {
    ms_played: Float
    ts: Date_
    username: Utf8
}

function buildPlot(data: Table<QueryResult>) {
    return Plot.plot({
        x: { type: 'utc' },
        y: { grid: true },
        color: { legend: true, type: 'categorical' },
        marks: [
            Plot.ruleY([0]),
            Plot.rectY(
                data,
                Plot.binX<{ y: string; fill: string; tip: boolean }>(
                    { y: 'sum' },
                    { x: 'ts', y: 'ms_played', fill: 'username', tip: true }
                )
            ),
        ],
    })
}

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
