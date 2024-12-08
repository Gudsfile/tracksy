import { useState, useEffect, useRef } from 'react'
import { queryDB } from '../../db/queries/queryDB'
import * as Plot from '@observablehq/plot'

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

export function ChartWrapper() {
    const [chartData, setChartData] = useState<
        Awaited<ReturnType<typeof queryDB>> | undefined
    >()

    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const getChartData = async () => {
            const result = await queryDB()
            setChartData(result)
        }
        getChartData()
    }, [])

    useEffect(() => {
        let element: ReturnType<typeof buildPlot> | undefined

        if (chartData !== undefined) {
            element = buildPlot(chartData)
            containerRef.current?.append(element)
        }
        return () => {
            element?.remove()
        }
    }, [chartData])

    return chartData && <div ref={containerRef} />
}
