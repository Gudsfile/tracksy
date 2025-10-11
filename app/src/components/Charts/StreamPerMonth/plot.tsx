import * as Plot from '@observablehq/plot'
import { QueryResult } from './query'
import { formatDuration } from './hooks/formatDuration'
import { formatMonthYear } from './hooks/formatMonthYear'

export function buildPlot(
    data: QueryResult[],
    isDark = false
): ReturnType<typeof Plot.plot> {
    return Plot.plot({
        x: {
            type: 'band',
            label: null,
            transform: Plot.utcInterval('month').floor,
        },
        y: { grid: true, label: null, tickFormat: formatDuration },
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
                tip: {
                    format: {
                        y: formatDuration,
                        x: formatMonthYear,
                    },
                },
            }),
        ],
    })
}
