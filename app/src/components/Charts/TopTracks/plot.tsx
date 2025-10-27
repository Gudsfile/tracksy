import * as Plot from '@observablehq/plot'
import { TopTracksQueryResult } from './query'
import { formatDuration } from '../../../utils/formatDuration'

export function buildPlot(
    data: TopTracksQueryResult[],
    isDark: boolean = false
): ReturnType<typeof Plot.plot> {
    if (data.length === 0) {
        return Plot.plot()
    }

    const yDomain = data.map((d) => `${d.track_name} — ${d.artist_name}`)

    return Plot.plot({
        title: 'Top Tracks',
        color: { scheme: isDark ? 'warm' : 'viridis' },
        style: {
            background: 'transparent',
        },
        width: 700,
        height: 400,
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
                    name: `${d.track_name} — ${d.artist_name}`,
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
                    name: `${d.track_name} — ${d.artist_name}`,
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
