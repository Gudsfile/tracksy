import * as Plot from '@observablehq/plot'
import type { CalendarHeatmapQueryResult } from './query'

type DayCell = {
    date: string
    week: number
    dayOfWeek: number
    stream_count: number
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatLocalDate(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

export function buildCells(
    data: CalendarHeatmapQueryResult[],
    year: number
): DayCell[] {
    const countByDay = new Map(data.map((d) => [d.day, d.stream_count]))
    const jan1DayOfWeek = new Date(year, 0, 1).getDay()

    const cells: DayCell[] = []
    const cursor = new Date(year, 0, 1)
    let i = 0

    while (cursor.getFullYear() === year) {
        const dateStr = formatLocalDate(cursor)
        cells.push({
            date: dateStr,
            week: Math.floor((i + jan1DayOfWeek) / 7),
            dayOfWeek: cursor.getDay(),
            stream_count: countByDay.get(dateStr) ?? 0,
        })
        cursor.setDate(cursor.getDate() + 1)
        i++
    }

    return cells
}

export function buildPlot(
    data: CalendarHeatmapQueryResult[],
    year: number | undefined,
    isDark = false
): ReturnType<typeof Plot.plot> {
    const targetYear = year ?? new Date().getFullYear()
    const cells = buildCells(data, targetYear)
    const maxCount = Math.max(1, ...cells.map((c) => c.stream_count))
    const maxCells = cells.filter((c) => c.stream_count === maxCount)

    return Plot.plot({
        title: `Listening activity ${targetYear}`,
        width: 900,
        height: 130,
        marginLeft: 40,
        marginTop: 20,
        marginBottom: 10,
        padding: 0.1,
        style: { background: 'transparent' },
        x: { axis: null },
        y: {
            domain: [0, 1, 2, 3, 4, 5, 6],
            tickFormat: (d: number) => DAY_LABELS[d],
            label: null,
        },
        color: {
            type: 'linear',
            range: [isDark ? '#374151' : '#f3f4f6', '#7c3aed'],
            domain: [0, maxCount],
        },
        marks: [
            Plot.cell(cells, {
                x: 'week',
                y: 'dayOfWeek',
                fill: 'stream_count',
                rx: 2,
                tip: {
                    format: {
                        x: false as never,
                        y: false as never,
                        fill: (d: number) => `${d.toLocaleString()} streams`,
                    },
                },
            }),
            Plot.cell(maxCells, {
                x: 'week',
                y: 'dayOfWeek',
                stroke: '#7c3aed',
                strokeWidth: 2,
                fill: 'none',
                rx: 2,
            }),
        ],
    })
}
