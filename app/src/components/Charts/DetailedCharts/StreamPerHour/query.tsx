import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryStreamPerHour from './StreamPerHour.sql?raw'

export function queryStreamsPerHoursByYear(year: number | undefined) {
    const { condition, params } = buildYearCondition(year)
    return {
        sql: sqlQueryStreamPerHour
            .replaceAll('${table}', TABLE)
            .replaceAll('${year_condition}', condition),
        params,
    }
}

export type StreamPerHourQueryResult = {
    hour: number
    count_streams: number
    ms_played: number
}
