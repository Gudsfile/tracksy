import { TABLE } from '../../../../db/queries/constants'
import sqlQueryNewVsOld from './NewVsOld.sql?raw'

export type NewVsOldResult = {
    new_artists_streams: number
    old_artists_streams: number
    new_artists_count: number
    total: number
}

export function queryNewVsOld(year: number): string {
    return sqlQueryNewVsOld
        .replaceAll('${table}', TABLE)
        .replaceAll('${year}', String(year))
}
