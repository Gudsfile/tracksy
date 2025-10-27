import * as Plot from '@observablehq/plot'
import { SummaryPerYearQueryResult } from './query'

export function buildPlot(
    data: SummaryPerYearQueryResult[]
): ReturnType<typeof Plot.plot> {
    let total = 1
    let unit = 1

    if (data.length > 0) {
        total = data.reduce((acc, val) => acc + val.count_streams, 0)
    }
    unit = Math.max(1, 10 ** (String(total).length - 3))

    const categoryMap: Record<string, { main: string; sub: string }> = {
        new_unique: { main: 'New Tracks', sub: 'First Listen' },
        new_repeat: { main: 'New Tracks', sub: 'Repeats' },
        old_unique: { main: 'Old Tracks', sub: 'First Listen' },
        old_repeat: { main: 'Old Tracks', sub: 'Repeats' },
    }

    const plotData = data.map((d) => ({
        ...d,
        main_category: categoryMap[d.type]?.main || d.type,
        sub_category: categoryMap[d.type]?.sub || d.type,
    }))

    const summaryData = Object.values(
        plotData.reduce(
            (acc, curr) => {
                if (!acc[curr.main_category]) {
                    acc[curr.main_category] = {
                        main_category: curr.main_category,
                        count_streams: 0,
                    }
                }
                acc[curr.main_category].count_streams += curr.count_streams
                return acc
            },
            {} as Record<
                string,
                { main_category: string; count_streams: number }
            >
        )
    )

    return Plot.plot({
        title: 'Distribution of streams',
        subtitle: `Each circle represents ${unit.toLocaleString()} streams`,
        axis: null,
        marginTop: 20,
        marginBottom: 70,
        color: {
            legend: true,
            domain: ['First Listen', 'Repeats'],
        },
        marks: [
            Plot.waffleY(
                { length: 1 },
                { y: total, fillOpacity: 0.4, rx: '100%', unit }
            ),
            Plot.waffleY(plotData, {
                fx: 'main_category',
                y: 'count_streams',
                fill: 'sub_category',
                tip: true,
                rx: '100%',
                unit: unit,
                sort: { fx: 'y', reduce: 'sum', reverse: true },
            }),
            Plot.text(summaryData, {
                fx: 'main_category',
                text: (d) =>
                    (d.count_streams / total).toLocaleString('en-US', {
                        style: 'percent',
                    }) +
                    ' ' +
                    d.main_category,
                frameAnchor: 'bottom',
                lineAnchor: 'top',
                dy: 10,
                fill: 'currentColor',
                fontSize: 24,
                fontWeight: 'bold',
            }),
        ],
    })
}
