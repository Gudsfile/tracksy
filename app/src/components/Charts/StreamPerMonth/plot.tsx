import * as Plot from '@observablehq/plot'
import type { Table } from 'apache-arrow'
import { QueryResult } from './query'

export function buildPlot(
    data?: Table<QueryResult>
): ReturnType<typeof Plot.plot> | undefined {
    if (!data) return undefined
    return Plot.plot({
        x: { type: 'utc' },
        y: { grid: true },
        marks: [
            Plot.ruleY([0]),
            Plot.rectY(
                data,
                Plot.binX<{
                    y: string
                    fill: Plot.ChannelValueSpec
                    tip: boolean
                }>(
                    { y: 'sum' },
                    { x: 'ts', y: 'ms_played', fill: true, tip: true }
                )
            ),
        ],
    })
}
