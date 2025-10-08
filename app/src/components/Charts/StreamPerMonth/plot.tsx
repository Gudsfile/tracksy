import * as Plot from '@observablehq/plot'
import type { Table } from 'apache-arrow'
import { QueryResult } from './query'

export function buildPlot(
    data: Table<QueryResult>,
    isDark = false
): ReturnType<typeof Plot.plot> {
    return Plot.plot({
        x: { type: 'utc' },
        y: { grid: true },
        color: { scheme: isDark ? 'warm' : 'blues' },
        style: {
            background: 'transparent',
        },
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
