import { TABLE } from '../../../../db/queries/constants'
import {
    buildYearCondition,
    buildYearOrLatest,
} from '../../../../db/queries/buildYearCondition'
import sqlQueryNewVsOld from './NewVsOld.sql?raw'

export type NewVsOldResult = {
    new_artists_streams: number
    old_artists_streams: number
    new_artists_count: number
    total: number
}

export function queryNewVsOld(year: number | undefined) {
    const { condition, params } = buildYearCondition(year)
    const yearForNew = buildYearOrLatest(year)
    return {
        sql: sqlQueryNewVsOld
            .replaceAll('${table}', TABLE)
            .replaceAll('${year_condition}', condition)
            .replaceAll('${year_for_new}', yearForNew),
        params,
    }
}
