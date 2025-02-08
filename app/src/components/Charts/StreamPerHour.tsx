import * as Plot from '@observablehq/plot'
import { useState, useEffect, useRef } from 'react'
import { queryDB } from '../../db/queries/queryDB'
import { TABLE } from '../../db/queries/constants'

const query = `
SELECT
  count(*)::int count_stream,
  hour(ts::datetime) as hour,
  username
FROM ${TABLE}
group by hour(ts::datetime), username
order by hour
`

function buildPlot(data: Awaited<ReturnType<typeof queryDB>>) {
    return Plot.plot({
        x: { label: 'Heure (HH)', type: 'band' },
        y: { label: 'Nombre de streams', grid: true },
        marks: [
            Plot.ruleY([0]),
            Plot.areaY(data, {
                x: 'hour',
                y: 'count_stream',
                fillOpacity: 0.2,
            }),
            Plot.lineY(data, {
                x: 'hour',
                y: 'count_stream',
                stroke: 'username',
                tip: true,
            }),
        ],
    })
}

export default function StreamPerHour() {
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
