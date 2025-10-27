import * as Plot from '@observablehq/plot'
import { TopArtistsQueryResult } from './query'
import { formatDuration } from '../../../utils/formatDuration'

export function buildPlot(
    data: TopArtistsQueryResult[],
    isDark: boolean = false
): ReturnType<typeof Plot.plot> {
    if (data.length === 0) {
        return Plot.plot()
    }

    const yDomain = [...data.map((d) => d.artist_name, 'Note')]

    return Plot.plot({
        title: 'Top Artists',
        subtitle:
            '⚠️ This chart is for informational purposes only. The data only includes artist names, and multiple artists may share the same name.',
        color: { scheme: isDark ? 'warm' : 'viridis' },
        style: {
            background: 'transparent',
        },
        width: 700,
        height: 420,
        marginLeft: 160,
        x: {
            label: null,
            ticks: [],
        },
        y: {
            label: null,
            domain: yDomain,
        },
        marks: [
            Plot.barX(
                data.map((d) => ({
                    name: d.artist_name,
                    count: d.count_streams,
                    duration: formatDuration(d.ms_played),
                })),
                {
                    x: 'count',
                    y: 'name',
                    fill: 'count',
                    channels: {
                        duration: 'duration',
                    },
                    tip: {
                        format: {
                            duration: true,
                        },
                    },
                }
            ),
            Plot.text(
                data.map((d) => ({
                    name: d.artist_name,
                    count: Number(d.count_streams),
                    label: Number(d.count_streams).toString(),
                })),
                {
                    x: 'count',
                    y: 'name',
                    text: 'label',
                    dx: 5,
                    dy: 0,
                    fill: isDark ? '#f1f1f1' : '#1f1f1f',
                    textAnchor: 'start',
                    fontSize: 12,
                }
            ),
        ],
    })
}
