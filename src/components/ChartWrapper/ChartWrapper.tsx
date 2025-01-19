import { useEffect, useRef } from 'react'
import { navigate } from 'astro/virtual-modules/transitions-router.js'
import * as Plot from '@observablehq/plot'

import { queryDB } from '../../db/queries/queryDB'

import { useChartsData } from './useChartsData'
import { RetryButton } from '../RetryButton/RetryButton'
import { Spinner } from '../Spinner/Spinner'

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

    const { data, isLoading, error, clearData } = useChartsData({
        onSuccess: () => console.debug('Data loaded successfully'),
        onFail: () => {
            navigate('/')
        },
    })

    const retryUpload = () => {
        clearData()
        navigate('/')
    }

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
        return (
            <div className="flex justify-center items-center">
                <Spinner />
            </div>
        )
    }

    if (error) {
        return (
            <>
                <div>Error loading data</div>
                <RetryButton onClick={() => retryUpload()} />
            </>
        )
    }

    return (
        data && (
            <>
                <div ref={containerRef} />
                <RetryButton
                    label="Upload other files"
                    onClick={() => {
                        retryUpload()
                    }}
                />
            </>
        )
    )
}
