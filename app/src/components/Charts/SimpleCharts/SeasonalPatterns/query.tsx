import { TABLE } from '../../../../db/queries/constants'
import sqlQuerySeasonalPatterns from './SeasonalPatterns.sql?raw'

export type SeasonalResult = {
    winter: number
    spring: number
    summer: number
    fall: number
    total: number
}

export function querySeasonalPatterns(year: number | undefined): string {
    const yearCondition =
        year !== undefined ? `year(ts::date) = ${year}` : '1=1'
    return sqlQuerySeasonalPatterns
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
