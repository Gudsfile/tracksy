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
            return a.stream_year - b.stream_year
        })

        const trackLastPoints = Array.from(
            new Set(sortedData.map((d) => d.track))
        ).map((track) => {
            const trackData = sortedData.filter((d) => d.track === track)
            return trackData[trackData.length - 1]
        })

        const sortedLabels = [...trackLastPoints].sort(
            (a, b) => a.stream_rank - b.stream_rank
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
                    x: 'stream_year',
                    y: 'stream_rank',
                    stroke: 'track',
                    strokeWidth: 2.5,
                }),
                Plot.dot(sortedData, {
                    x: 'stream_year',
                    y: 'stream_rank',
                    fill: 'track',
                    r: 4,
                }),

                Plot.text(labelsEven, {
                    x: 'stream_year',
                    y: 'stream_rank',
                    text: 'track',
                    fill: 'track',
                    dx: 10,
                    dy: -8,
                    textAnchor: 'start',
                    fontSize: 11,
                    fontWeight: 'bold',
                }),
                Plot.text(labelsOdd, {
                    x: 'stream_year',
                    y: 'stream_rank',
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
                        x: 'stream_year',
                        y: 'stream_rank',
                        title: (d) =>
                            `${d.track} - ${d.artist}\nRank: ${d.stream_rank}\nYear: ${d.stream_year}\nCount: ${d.play_count}`,
                    })
                ),
            ],
        })

        containerRef.current.replaceChildren(plot)

        return () => plot.remove()
    }, [data])

    return <div ref={containerRef} />
}
