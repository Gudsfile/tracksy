import { useEffect, useRef } from 'react'
import { navigate } from 'astro/virtual-modules/transitions-router.js'
import * as Plot from '@observablehq/plot'

import { queryDB } from '../../db/queries/queryDB'
import { useChartsData } from './useChartsData'

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
    const containerRef = useRef<HTMLDivElement>(null)

    const { data, isLoading, error } = useChartsData({
        onSuccess: () => console.debug('Data loaded successfully'),
        onFail: () => {
            navigate('/')
        },
    })

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

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error loading data</div>
    }

    return data && <div ref={containerRef} />
}
