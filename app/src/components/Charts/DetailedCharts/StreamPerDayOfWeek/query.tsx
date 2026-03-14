import { TABLE } from '../../../../db/queries/constants'
import sqlQueryStreamPerDayOfWeek from './StreamPerDayOfWeek.sql?raw'

export function streamPerDayOfWeekQueryByYear(year: number | undefined) {
    const yearCondition = year ? `YEAR(ts:: DATETIME) = ${year}` : '1=1'
    return sqlQueryStreamPerDayOfWeek
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}

export type StreamPerDayOfWeekQueryResult = {
    day_of_week: number
    hour: number
    count_streams: number
}
