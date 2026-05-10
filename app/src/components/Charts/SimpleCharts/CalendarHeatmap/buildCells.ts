import type { CalendarHeatmapQueryResult } from './query'

type DayCell = {
    date: string
    week: number
    dayOfWeek: number
    stream_count: number
}

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
