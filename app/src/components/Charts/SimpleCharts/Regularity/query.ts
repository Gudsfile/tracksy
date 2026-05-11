import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryRegularity from './Regularity.sql?raw'

export type RegularityResult = {
    days_with_streams: number
    total_days: number
    longest_pause_days: number
}

export function queryRegularity(year: number | undefined): string {
    const yearCondition = buildYearCondition(year)
    let query = sqlQueryRegularity
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
    if (year !== undefined) {
        query = query.replaceAll('${ year}', String(year))
    } else {
        query = query
            .replaceAll(
                "'${ year}-12-31'::date",
                `(select max(ts::date) from ${TABLE})`
            )
            .replaceAll(
                "'${ year}-01-01'::date",
                `(select min(ts::date) from ${TABLE})`
            )
    }
    return query
}
