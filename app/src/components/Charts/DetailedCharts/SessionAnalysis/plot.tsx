import * as Plot from '@observablehq/plot'
import type { SessionAnalysisDetailedResult } from './query'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function buildPlot(
    data: SessionAnalysisDetailedResult[],
    isDark = false
): HTMLDivElement {
    const brandPurple = '#7c3aed'
    const style = {
        background: 'transparent',
        color: isDark ? '#e5e7eb' : '#1f2937',
    }

    const hist = Plot.plot({
        title: 'Session duration distribution',
        width: 600,
        height: 220,
        style,
        x: { label: 'Duration (min)', nice: true },
        y: { label: 'Sessions', grid: true },
        color: { range: ['#ede9fe', brandPurple] },
        marks: [
            Plot.rectY(data, {
                ...Plot.binX(
                    { y: 'count', fill: 'count' },
                    {
                        x: (d: SessionAnalysisDetailedResult) =>
                            d.duration_ms / 60000,
                        thresholds: [0, 10, 20, 40, 60, 90, 120],
                    }
                ),
                tip: true,
            }),
            Plot.ruleY([0]),
        ],
    })

    const scatter = Plot.plot({
        title: 'Sessions over time',
        width: 600,
        height: 260,
        style,
        x: { label: 'Date', type: 'time', nice: true },
        y: {
            label: 'Start hour',
            domain: [0, 23],
            tickFormat: (d: number) => `${d}h`,
        },
        r: { range: [2, 20] },
        marks: [
            Plot.dot(data, {
                x: (d: SessionAnalysisDetailedResult) =>
                    new Date(d.session_start),
                y: (d: SessionAnalysisDetailedResult) =>
                    new Date(d.session_start).getHours(),
                r: (d: SessionAnalysisDetailedResult) => d.duration_ms / 60000,
                fill: brandPurple,
                fillOpacity: 0.6,
                tip: true,
            }),
        ],
    })

    const countByDay = data.reduce<number[]>(
        (acc, d) => {
            acc[d.day_of_week]++
            return acc
        },
        [0, 0, 0, 0, 0, 0, 0]
    )
    const dayCounts = DAYS.map((day, i) => ({ day, count: countByDay[i] }))

    const dayBar = Plot.plot({
        title: 'Sessions by day of week',
        width: 400,
        height: 200,
        style,
        x: { label: 'Day', domain: DAYS },
        y: { label: 'Sessions', grid: true },
        marks: [
            Plot.barY(dayCounts, {
                x: 'day',
                y: 'count',
                fill: brandPurple,
                tip: true,
            }),
            Plot.ruleY([0]),
        ],
    })

    const container = document.createElement('div')
    container.className = 'space-y-4 p-4'
    container.append(hist, scatter, dayBar)
    return container
}
