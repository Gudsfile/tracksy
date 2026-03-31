import { TABLE } from '../../../../db/queries/constants'
import sqlQueryStreamPerMonth from './StreamPerMonth.sql?raw'

export function queryByYear(year: number | undefined) {
    const yearCondition = year ? `YEAR(ts::DATE) = ${year}` : '1=1'
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
