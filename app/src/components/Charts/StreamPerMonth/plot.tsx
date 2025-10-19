import * as Plot from '@observablehq/plot'
import { QueryResult } from './query'
import { formatDuration } from './hooks/formatDuration'
import { formatMonthYear } from './hooks/formatMonthYear'
import * as d3 from 'd3'

export function buildPlot(
    data: QueryResult[],
    maxValue: number | undefined,
    isDark = false
): ReturnType<typeof Plot.plot> {
    const maxDuration = maxValue || d3.max(data, (d) => d.ms_played) || 100
    return Plot.plot({
        x: {
            type: 'band',
            label: null,
            transform: Plot.utcInterval('month').floor,
        },
        y: {
            grid: true,
            label: null,
            tickFormat: formatDuration,
            domain: [0, maxDuration],
        },
        color: { scheme: isDark ? 'warm' : 'viridis' },
        style: {
            background: 'transparent',
        },
        marginLeft: 100,
        marks: [
            Plot.ruleY([0]),
            Plot.barY(data, {
                x: 'ts',
                y: 'ms_played',
                fill: 'ts',
                channels: {
                    count_streams: 'count_streams',
                },
                tip: {
                    format: {
                        y: formatDuration,
                        x: formatMonthYear,
                        count_streams: true,
                    },
                },
            }),
        ],
    })
}
