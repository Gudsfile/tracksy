import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQuerySeasonalPatterns from './SeasonalPatterns.sql?raw'

export type SeasonalResult = {
    winter: number
    spring: number
    summer: number
    fall: number
    total: number
}

export function querySeasonalPatterns(year: number | undefined) {
    const { condition, params } = buildYearCondition(year)
    return {
        sql: sqlQuerySeasonalPatterns
            .replaceAll('${table}', TABLE)
            .replaceAll('${year_condition}', condition),
        params,
    }
}
