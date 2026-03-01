import * as Plot from '@observablehq/plot'
import { useEffect, useRef } from 'react'
import type { ArtistDiscoveryQueryResult } from './query'
import * as d3 from 'd3'

import { useState } from 'react'

export function ArtistDiscoveryPlot({
    data,
}: {
    data: ArtistDiscoveryQueryResult[]
}) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [mode, setMode] = useState<'cumulative' | 'new'>('cumulative')

    function toggleMode() {
        setMode(mode === 'cumulative' ? 'new' : 'cumulative')
    }

    useEffect(() => {
        if (!data?.length || !containerRef.current) return

        const vMain = (d: ArtistDiscoveryQueryResult) => d.cumulative_artists
        const vAvg = (d: ArtistDiscoveryQueryResult) => d.avg_listens_per_artist

        const visibleSeries =
            mode === 'cumulative'
                ? data.map(vMain)
                : data.map((d) => d.new_artists)

        const maxVisible = d3.max(visibleSeries)!

        const yAvg = d3.scaleLinear<number, number>(
            d3.extent(data, vAvg) as [number, number],
            [0, maxVisible]
        )

        const marks = [
            Plot.axisY({
                anchor: 'right',
                label: 'Number of Artists',
            }),

            Plot.axisY(yAvg.ticks(), {
                anchor: 'left',
                label: 'Avg listens per artist',
                y: yAvg,
                tickFormat: yAvg.tickFormat(),
            }),

            Plot.ruleY([0]),
        ]

        if (mode === 'cumulative') {
            marks.push(
                Plot.areaY(data, {
                    x: 'year',
                    y: 'cumulative_artists',
                    fill: 'url(#gradient-cumulative)',
                    fillOpacity: 0.3,
                }),
                Plot.lineY(data, {
                    x: 'year',
                    y: 'cumulative_artists',
                    stroke: '#8b5cf6',
                    strokeWidth: 2.5,
                }),
                Plot.dot(data, {
                    x: 'year',
                    y: 'cumulative_artists',
                    fill: '#8b5cf6',
                    r: 4,
                })
            )
        }

        if (mode === 'new') {
            marks.push(
                Plot.lineY(data, {
                    x: 'year',
                    y: 'new_artists',
                    stroke: '#06b6d4',
                    strokeWidth: 2,
                }),
                Plot.dot(data, {
                    x: 'year',
                    y: 'new_artists',
                    fill: '#06b6d4',
                    r: 3,
                })
            )
        }

        marks.push(
            Plot.lineY(
                data,
                Plot.mapY((D: number[]) => D.map(yAvg), {
                    x: 'year',
                    y: 'avg_listens_per_artist',
                    stroke: '#f59e0b',
                    strokeWidth: 2.5,
                    strokeDasharray: '5,3',
                })
            )
        )

        const plot = Plot.plot({
            title: 'Artists Discovered Over Time',
            subtitle: `${mode === 'cumulative' ? 'Cumulative unique artists' : 'New discoveries'} and avg listens per artist per year`,
            width: 800,
            height: 400,
            marginLeft: 90,
            marginRight: 120,
            x: { label: 'Year', tickFormat: 'd' },
            y: { label: null, grid: true },
            marks,
        })

        containerRef.current.innerHTML = ''
        containerRef.current.append(plot)

        return () => plot.remove()
    }, [data, mode])

    const modeLabel = mode == 'cumulative' ? '↗️ Cumulative' : '🆕 New'
    const modeAriaLabel =
        mode === 'cumulative'
            ? 'Show cumulative number of unique artists'
            : 'Show newly discovered artists'

    return (
        <>
            <button
                onClick={toggleMode}
                className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800/80 backdrop-blur-sm rounded-full hover:bg-brand-purple/20 hover:text-brand-purple dark:hover:bg-brand-purple/20 dark:hover:text-brand-purple transition-all duration-300 border border-gray-300/50 dark:border-slate-700/50"
                aria-label={modeAriaLabel}
            >
                {modeLabel}
            </button>

            <div ref={containerRef} />
        </>
    )
}
