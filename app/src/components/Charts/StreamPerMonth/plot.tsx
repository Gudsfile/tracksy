import * as Plot from '@observablehq/plot'
import { QueryResult } from './query'

export function buildPlot(
    data: QueryResult[],
    isDark = false
): ReturnType<typeof Plot.plot> {
    return Plot.plot({
        x: { type: 'utc', label: null },
        y: { grid: true, label: null },
        color: { scheme: isDark ? 'warm' : 'viridis' },
        style: {
            background: 'transparent',
        },
        marginLeft: 100,
        marks: [
            Plot.ruleY([0]),
            Plot.rectY(
                data,
                Plot.binX<{
                    y: string
                    fill: Plot.ChannelValueSpec
                    tip: boolean
                }>(
                    { y: 'sum', interval: 'month' },
                    { x: 'ts', y: 'ms_played', fill: 'ts', tip: true }
                )
            ),
        ],
    })
}
