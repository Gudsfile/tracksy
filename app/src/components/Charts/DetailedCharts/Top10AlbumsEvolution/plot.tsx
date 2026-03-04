import * as Plot from '@observablehq/plot'
import { useEffect, useRef } from 'react'
import type { Top10AlbumsEvolutionQueryResult } from './query'

export function Top10AlbumsEvolutionPlot({
    data,
}: {
    data: Top10AlbumsEvolutionQueryResult[]
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
            if (a.album !== b.album) return a.album.localeCompare(b.album)
            return a.year - b.year
        })

        const albumLastPoints = Array.from(
            new Set(sortedData.map((d) => d.album))
        ).map((album) => {
            const albumData = sortedData.filter((d) => d.album === album)
            return albumData[albumData.length - 1]
        })

        const sortedLabels = [...albumLastPoints].sort(
            (a, b) => a.rank - b.rank
        )
        const labelsEven = sortedLabels.filter((_, i) => i % 2 === 0)
        const labelsOdd = sortedLabels.filter((_, i) => i % 2 === 1)

        const plot = Plot.plot({
            title: 'Global Top 10 Albums Evolution',
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
                    stroke: 'album',
                    strokeWidth: 2.5,
                }),
                Plot.dot(sortedData, {
                    x: 'year',
                    y: 'rank',
                    fill: 'album',
                    r: 4,
                }),

                Plot.text(labelsEven, {
                    x: 'year',
                    y: 'rank',
                    text: 'album',
                    fill: 'album',
                    dx: 10,
                    dy: -8,
                    textAnchor: 'start',
                    fontSize: 11,
                    fontWeight: 'bold',
                }),
                Plot.text(labelsOdd, {
                    x: 'year',
                    y: 'rank',
                    text: 'album',
                    fill: 'album',
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
                            `${d.album} - ${d.artist}\nRank: ${d.rank}\nYear: ${d.year}\nCount: ${d.play_count}`,
                    })
                ),
            ],
        })

        containerRef.current.append(plot)

        return () => plot.remove()
    }, [data])

    return <div ref={containerRef} />
}
