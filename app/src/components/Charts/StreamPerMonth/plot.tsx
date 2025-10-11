import * as Plot from '@observablehq/plot'
import { QueryResult } from './query'
import { formatDuration } from './hooks/formatDuration'
import { formatMonthYear } from './hooks/formatMonthYear'

export function buildPlot(
    data: QueryResult[],
    isDark = false
): ReturnType<typeof Plot.plot> {
    return Plot.plot({
        x: { type: 'utc', label: null },
        y: { grid: true, label: null, tickFormat: formatDuration },
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
                    tip: Plot.TipOptions
                }>(
                    { y: 'sum', interval: 'month' },
                    {
                        x: 'ts',
                        y: 'ms_played',
                        fill: 'ts',
                        tip: {
                            format: {
                                y: formatDuration,
                                x: formatMonthYear,
                            },
                        },
                    }
                )
            ),
        ],
    })
}
