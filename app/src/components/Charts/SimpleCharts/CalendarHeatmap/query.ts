import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryCalendarHeatmap from './CalendarHeatmap.sql?raw'
import { DAILY_STREAM_COUNTS_TABLE } from '../../../../db/queries/constants'

export type CalendarHeatmapQueryResult = {
    day: string
    stream_count: number
}

export function buildCalendarHeatmapQuery(year: number | undefined): string {
    const yearCondition = buildYearCondition(year, 'year(day)')
    return sqlQueryCalendarHeatmap
        .replaceAll('${table}', DAILY_STREAM_COUNTS_TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
