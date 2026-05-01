import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQuerySkipRate from './SkipRate.sql?raw'

export type SkipRateResult = {
    complete_listens: number
    skipped_listens: number
}

export function querySkipRate(year: number | undefined): string {
    const yearCondition = buildYearCondition(year)
    return sqlQuerySkipRate
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
