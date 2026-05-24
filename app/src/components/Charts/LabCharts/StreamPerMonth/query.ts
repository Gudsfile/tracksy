import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryStreamPerMonth from './StreamPerMonth.sql?raw'

export function queryStreamsPerMonthByYear(year: number | undefined) {
    const yearCondition = buildYearCondition(year)
    return sqlQueryStreamPerMonth
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}

export type StreamPerMonthQueryResult = {
    ts: string
    ms_played: number
    count_streams: number
}
