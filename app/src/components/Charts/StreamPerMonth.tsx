import * as Plot from '@observablehq/plot'
import { useState, useEffect, useRef } from 'react'
import { queryDB } from '../../db/queries/queryDB'
import { TABLE } from '../../db/queries/constants'

const query = `
SELECT
  ms_played,
  ts::date as ts,
  username
FROM ${TABLE}
order by ts
`

function buildPlot(data: Awaited<ReturnType<typeof queryDB>>) {
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

export default function StreamPerMonth() {
    const [data, setData] = useState<
        Awaited<ReturnType<typeof queryDB>> | undefined
    >()

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const getData = async () => {
            const result = await queryDB(query)
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
