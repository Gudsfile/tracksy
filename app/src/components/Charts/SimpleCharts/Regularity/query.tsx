import { TABLE } from '../../../../db/queries/constants'
import sqlQueryRegularity from './Regularity.sql?raw'

export type RegularityResult = {
    days_with_streams: number
    total_days: number
    longest_pause_days: number
}

export function queryRegularity(year: number): string {
    return sqlQueryRegularity
        .replaceAll('${table}', TABLE)
        .replaceAll('${ year}', String(year))
        .replaceAll('${year}', String(year))
}
