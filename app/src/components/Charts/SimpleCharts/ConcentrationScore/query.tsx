import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryConcentrationScore from './ConcentrationScore.sql?raw'

export type ConcentrationResult = {
    top5_pct: number
    top10_pct: number
    top20_pct: number
}

export function queryConcentrationScore(year: number | undefined) {
    const { condition, params } = buildYearCondition(year)
    return {
        sql: sqlQueryConcentrationScore
            .replaceAll('${table}', TABLE)
            .replaceAll('${year_condition}', condition),
        params,
    }
}
