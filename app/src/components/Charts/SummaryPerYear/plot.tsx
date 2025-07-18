import * as Plot from '@observablehq/plot'
import type { Table } from 'apache-arrow'
import { QueryResult } from './query'

export function buildPlot(
    data?: Table<QueryResult>
): ReturnType<typeof Plot.plot> | undefined {
    if (!data) return undefined
    return Plot.plot({
        title: 'Portition of new streams',
        y: { grid: true },
        color: { legend: true },
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
