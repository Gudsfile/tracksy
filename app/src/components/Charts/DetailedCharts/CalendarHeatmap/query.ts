import { buildYearCondition } from '../../../../db/queries/buildYearCondition'

export type CalendarHeatmapQueryResult = {
    day: string
    stream_count: number
}

export function buildCalendarHeatmapQuery(year: number | undefined): string {
    const yearCondition = buildYearCondition(year, 'year(day)')
    return `
        SELECT day::VARCHAR AS day, stream_count::DOUBLE AS stream_count
        FROM daily_stream_counts
        WHERE ${yearCondition}
        ORDER BY day
    `
}
