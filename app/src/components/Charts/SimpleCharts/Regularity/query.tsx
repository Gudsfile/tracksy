import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryRegularity from './Regularity.sql?raw'

export type RegularityResult = {
    days_with_streams: number
    total_days: number
    longest_pause_days: number
}

export function queryRegularity(year: number | undefined) {
    const { condition, params } = buildYearCondition(year)
    let sql = sqlQueryRegularity
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', condition)
    if (year !== undefined) {
        // Date literals (e.g. '2024-01-01'::date) cannot be parameterized — typed integer, safe to interpolate
        sql = sql.replaceAll('${ year}', String(Math.trunc(year)))
    } else {
        sql = sql
            .replaceAll(
                "'${ year}-12-31'::date",
                `(select max(ts::date) from ${TABLE})`
            )
            .replaceAll(
                "'${ year}-01-01'::date",
                `(select min(ts::date) from ${TABLE})`
            )
    }
    return { sql, params }
}
