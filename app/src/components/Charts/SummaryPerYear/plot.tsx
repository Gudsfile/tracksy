import * as Plot from '@observablehq/plot'
import type { Table } from 'apache-arrow'
import { QueryResult } from './query'

export function buildPlot(
    data: Table<QueryResult>
): ReturnType<typeof Plot.plot> {
    let total = 1
    let unit = 1

    if (data.numRows > 0) {
        total = data
            .select(['count_streams'])
            .toArray()
            .reduce((acc, val) => acc + val.count_streams, 0)
    }
    unit = Math.max(1, 10 ** (String(total).length - 3))

    return Plot.plot({
        title: 'Distribution of new streams',
        subtitle: `Each circle represents ${unit.toLocaleString()} streams`,
        axis: null,
        marginTop: 20,
        marginBottom: 70,
        color: { legend: true },
        marks: [
            Plot.waffleY(
                { length: 1 },
                { y: total, fillOpacity: 0.4, rx: '100%', unit }
            ),
            Plot.waffleY(data, {
                fx: 'type',
                y: 'count_streams',
                fill: 'type',
                tip: true,
                rx: '100%',
                unit: unit,
            }),
            Plot.text(data, {
                fx: 'type',
                text: (d) =>
                    (d.count_streams / total).toLocaleString('en-US', {
                        style: 'percent',
                    }),
                frameAnchor: 'bottom',
                lineAnchor: 'top',
                dy: 6,
                fill: 'type',
                fontSize: 24,
                fontWeight: 'bold',
            }),
        ],
    })
}
