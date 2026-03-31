import { TABLE } from '../../../../db/queries/constants'
import sqlQuerySkipRate from './SkipRate.sql?raw'

export type SkipRateResult = {
    complete_listens: number
    skipped_listens: number
}

export function querySkipRate(year: number | undefined): string {
    const yearCondition =
        year !== undefined ? `year(ts::date) = ${year}` : '1=1'
    return sqlQuerySkipRate
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
