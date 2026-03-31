import { TABLE } from '../../../../db/queries/constants'
import sqlQueryNewVsOld from './NewVsOld.sql?raw'

export type NewVsOldResult = {
    new_artists_streams: number
    old_artists_streams: number
    new_artists_count: number
    total: number
}

export function queryNewVsOld(year: number | undefined): string {
    const yearCondition =
        year !== undefined ? `year(ts::date) = ${year}` : '1=1'
    const yearForNew =
        year !== undefined
            ? String(year)
            : `(select max(year(ts::date)) from ${TABLE})`
    return sqlQueryNewVsOld
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
        .replaceAll('${year_for_new}', yearForNew)
}
