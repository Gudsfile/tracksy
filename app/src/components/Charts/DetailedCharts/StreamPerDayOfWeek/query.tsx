import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryStreamPerDayOfWeek from './StreamPerDayOfWeek.sql?raw'

export function streamPerDayOfWeekQueryByYear(year: number | undefined) {
    const { condition, params } = buildYearCondition(year)
    return {
        sql: sqlQueryStreamPerDayOfWeek
            .replaceAll('${table}', TABLE)
            .replaceAll('${year_condition}', condition),
        params,
    }
}

export type StreamPerDayOfWeekQueryResult = {
    day_of_week: number
    hour: number
    count_streams: number
}
