import * as Plot from '@observablehq/plot'
import type { Table } from 'apache-arrow'
import { QueryResult } from './query'

export function buildPlot(
    data: Table<QueryResult>
): ReturnType<typeof Plot.plot> {
    return Plot.plot({
        title: 'Portition of new streams',
        axis: null,
        marginTop: 20,
        marginBottom: 70,
        color: { legend: true },
        marks: [
            Plot.waffleY(data, {
                x: 'year',
                y: 'count_streams',
                fill: 'type',
                unit: 100,
                tip: true,
                rx: '100%',
            }),
        ],
    })
}
