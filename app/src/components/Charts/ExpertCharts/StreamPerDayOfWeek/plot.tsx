import * as Plot from '@observablehq/plot'
import { StreamPerDayOfWeekQueryResult } from './query'

export function buildPlot(
    data: StreamPerDayOfWeekQueryResult[],
    isDark: boolean = false
): ReturnType<typeof Plot.plot> {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return Plot.plot({
        title: 'Stream per hour and day of week',
        width: 800,
        height: 400,
        marginLeft: 70,
        marginBottom: 50,
        x: {
            label: 'Time of day →',
            domain: [...Array(24).keys()],
            tickFormat: (d) => `${d}h`,
        },
        y: {
            label: 'Day of week →',
            domain: [1, 2, 3, 4, 5, 6, 0],
            tickFormat: (d) => days[d],
            reverse: false,
        },
        color: {
            type: 'linear',
            label: 'Number of streams',
            scheme: isDark ? 'warm' : 'cool',
        },
        marks: [
            Plot.rect(data, {
                x: 'hour',
                y: 'dayOfWeek',
                fill: 'count_streams',
                tip: {
                    format: {
                        x: (d) => `${d}h`,
                        y: (d) => days[d - 1],
                        fill: (d) => `${d} streams`,
                    },
                },
            }),
            Plot.ruleX([...Array(24).keys()], {
                stroke: '#fff',
                strokeOpacity: 0.2,
            }),
            Plot.ruleY([0, 1, 2, 3, 4, 5, 6], {
                stroke: '#fff',
                strokeOpacity: 0.2,
            }),
        ],
    })
}
