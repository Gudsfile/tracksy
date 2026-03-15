import { TABLE } from '../../../../db/queries/constants'
import sqlQuerySkipRate from './SkipRate.sql?raw'

export type SkipRateResult = {
    complete_listens: number
    skipped_listens: number
}

export function querySkipRate(year: number): string {
    return sqlQuerySkipRate
        .replaceAll('${table}', TABLE)
        .replaceAll('${year}', String(year))
}
