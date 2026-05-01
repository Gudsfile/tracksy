import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryStreamPerHour from './StreamPerHour.sql?raw'

export function queryStreamsPerHoursByYear(year: number | undefined) {
    const yearCondition = buildYearCondition(year)
    return sqlQueryStreamPerHour
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}

export type StreamPerHourQueryResult = {
    hour: number
    count_streams: number
    ms_played: number
}
