import { TABLE } from '../../../../db/queries/constants'
import sqlQuerySeasonalPatterns from './SeasonalPatterns.sql?raw'

export type SeasonalResult = {
    winter: number
    spring: number
    summer: number
    fall: number
    total: number
}

export function querySeasonalPatterns(year: number): string {
    return sqlQuerySeasonalPatterns
        .replaceAll('${table}', TABLE)
        .replaceAll('${year}', String(year))
}
