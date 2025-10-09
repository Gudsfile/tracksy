import * as Plot from '@observablehq/plot'
import type { Table } from 'apache-arrow'
import { QueryResult } from './query'

export function buildPlot(
    data: Table<QueryResult>
): ReturnType<typeof Plot.plot> {
    return Plot.plot({
        title: 'Partition of new streams',
        y: { grid: true },
        color: {
            legend: true,
            scheme: 'tableau10',
        },
        style: {
            background: 'transparent',
        },
        marks: [
            Plot.rectY(
                data,
                Plot.binX<{ y: string; fill: string; tip: boolean }>(
                    { y: 'sum' },
                    {
                        x: 'year',
                        y: 'count_streams',
                        fill: 'type',
                        tip: true,
                        interval: 1,
                    }
                )
            ),
            Plot.ruleY([0]),
        ],
    })
}
