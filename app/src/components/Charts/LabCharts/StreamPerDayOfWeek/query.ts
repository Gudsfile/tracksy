import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryStreamPerDayOfWeek from './StreamPerDayOfWeek.sql?raw'

export function streamPerDayOfWeekQueryByYear(year: number | undefined) {
    const yearCondition = buildYearCondition(year)
    return sqlQueryStreamPerDayOfWeek
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}

export type StreamPerDayOfWeekQueryResult = {
    stream_date_ts: number // epoch ms, consistent with Top10Race
    day_of_week: number // 0 = Sun, 1 = Mon, ..., 6 = Sat (DuckDB dayofweek convention)
    play_hour: number // 0-23
    cumulative_count: number
}
