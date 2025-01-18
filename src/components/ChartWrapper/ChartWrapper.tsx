import { useState, useEffect, useRef } from 'react'
import { queryDB } from '../../db/queries/queryDB'
import * as Plot from '@observablehq/plot'
import { insertDataInDatabase } from '../../db/commands/insertDataInDatabase'
import { retrieveJSON } from '../../db/storage/retriveJSON'
import { SESSION_STORAGE_KEY } from '../../db/constants'
import { navigate } from 'astro/virtual-modules/transitions-router.js'

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
            const datasets =
                retrieveJSON<Record<string, unknown>[]>(SESSION_STORAGE_KEY)
            if (datasets !== null) {
                await insertDataInDatabase(datasets)
                const result = await queryDB()
                setChartData(result)
            } else {
                navigate('/')
            }
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
