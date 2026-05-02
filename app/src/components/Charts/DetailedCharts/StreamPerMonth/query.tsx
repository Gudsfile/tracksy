import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryStreamPerMonth from './StreamPerMonth.sql?raw'

export function queryByYear(year: number | undefined) {
    const { condition, params } = buildYearCondition(year)
    const sql = sqlQueryStreamPerMonth
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', condition)
    // The year condition appears multiple times in the SQL (date range + filter),
    // so we need one param per '?' placeholder in the final query.
    const placeholderCount =
        params.length > 0 ? (sql.match(/\?/g) ?? []).length : 0
    return {
        sql,
        params: Array.from({ length: placeholderCount }, () => params[0]),
    }
}

export function queryStreamsPerMonthByYear(year: number | undefined) {
    return queryByYear(year)
}

export type StreamPerMonthQueryResult = {
    ts: number
    ms_played: number
    count_streams: number
}
