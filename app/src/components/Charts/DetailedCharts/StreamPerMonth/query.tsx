import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryStreamPerMonth from './StreamPerMonth.sql?raw'

export function queryByYear(year: number | undefined) {
    const yearCondition = buildYearCondition(year)
    return sqlQueryStreamPerMonth
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}

export function queryStreamsPerMonthByYear(year: number | undefined) {
    return queryByYear(year)
}

export type StreamPerMonthQueryResult = {
    ts: number
    ms_played: number
    count_streams: number
}
