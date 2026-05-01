import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition, buildYearOrLatest } from '../../../../db/queries/buildYearCondition'
import sqlQueryNewVsOld from './NewVsOld.sql?raw'

export type NewVsOldResult = {
    new_artists_streams: number
    old_artists_streams: number
    new_artists_count: number
    total: number
}

export function queryNewVsOld(year: number | undefined): string {
    const yearCondition = buildYearCondition(year)
    const yearForNew = buildYearOrLatest(year)
    return sqlQueryNewVsOld
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
        .replaceAll('${year_for_new}', yearForNew)
}
