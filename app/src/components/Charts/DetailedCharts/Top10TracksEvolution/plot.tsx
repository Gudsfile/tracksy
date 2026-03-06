import * as Plot from '@observablehq/plot'
import { useEffect, useRef } from 'react'
import type { Top10TracksEvolutionQueryResult } from './query'

export function Top10TracksEvolutionPlot({
    data,
}: {
    data: Top10TracksEvolutionQueryResult[]
}) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!data || data.length === 0) {
            return
        }

        if (!containerRef.current) {
            return
        }

        const sortedData = [...data].sort((a, b) => {
            if (a.track !== b.track) return a.track.localeCompare(b.track)
            return a.year - b.year
        })

        const trackLastPoints = Array.from(
            new Set(sortedData.map((d) => d.track))
        ).map((track) => {
            const trackData = sortedData.filter((d) => d.track === track)
            return trackData[trackData.length - 1]
        })

        const sortedLabels = [...trackLastPoints].sort(
            (a, b) => a.rank - b.rank
        )
        const labelsEven = sortedLabels.filter((_, i) => i % 2 === 0)
        const labelsOdd = sortedLabels.filter((_, i) => i % 2 === 1)

        const plot = Plot.plot({
            title: 'Global Top 10 Track Evolution',
            width: 1200,
            height: 700,
            marginLeft: 60,
            marginRight: 200,
            style: {
                background: 'transparent',
                fontSize: '12px',
            },
            y: {
                label: 'Rank',
                type: 'log',
                reverse: true,
                grid: true,
            },
            x: {
                label: 'Year',
                tickFormat: 'd',
            },
            color: {
                legend: false,
            },
            marks: [
                Plot.lineY(sortedData, {
                    x: 'year',
                    y: 'rank',
                    stroke: 'track',
                    strokeWidth: 2.5,
                }),
                Plot.dot(sortedData, {
                    x: 'year',
                    y: 'rank',
                    fill: 'track',
                    r: 4,
                }),

                Plot.text(labelsEven, {
                    x: 'year',
                    y: 'rank',
                    text: 'track',
                    fill: 'track',
                    dx: 10,
                    dy: -8,
                    textAnchor: 'start',
                    fontSize: 11,
                    fontWeight: 'bold',
                }),
                Plot.text(labelsOdd, {
                    x: 'year',
                    y: 'rank',
                    text: 'track',
                    fill: 'track',
                    dx: 10,
                    dy: 8,
                    textAnchor: 'start',
                    fontSize: 11,
                    fontWeight: 'bold',
                }),
                Plot.tip(
                    sortedData,
                    Plot.pointerX({
                        x: 'year',
                        y: 'rank',
                        title: (d) =>
                            `${d.track} - ${d.artist}\nRank: ${d.rank}\nYear: ${d.year}\nCount: ${d.play_count}`,
                    })
                ),
            ],
        })

        containerRef.current.append(plot)

        return () => plot.remove()
    }, [data])

    return <div ref={containerRef} />
}
