import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQuerySkipRate from './SkipRate.sql?raw'

export type SkipRateResult = {
    complete_listens: number
    skipped_listens: number
}

export function querySkipRate(year: number | undefined) {
    const { condition, params } = buildYearCondition(year)
    return {
        sql: sqlQuerySkipRate
            .replaceAll('${table}', TABLE)
            .replaceAll('${year_condition}', condition),
        params,
    }
}
