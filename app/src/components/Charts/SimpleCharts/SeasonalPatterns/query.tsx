import { TABLE } from '../../../../db/queries/constants'

export type SeasonalResult = {
    winter: number
    spring: number
    summer: number
    fall: number
    total: number
}

export function querySeasonalPatterns(): string {
    return `
    SELECT
      SUM(CASE WHEN MONTH(ts::DATE) IN (12, 1, 2) THEN 1 ELSE 0 END)::DOUBLE AS winter,
      SUM(CASE WHEN MONTH(ts::DATE) IN (3, 4, 5) THEN 1 ELSE 0 END)::DOUBLE AS spring,
      SUM(CASE WHEN MONTH(ts::DATE) IN (6, 7, 8) THEN 1 ELSE 0 END)::DOUBLE AS summer,
      SUM(CASE WHEN MONTH(ts::DATE) IN (9, 10, 11) THEN 1 ELSE 0 END)::DOUBLE AS fall,
      COUNT(*)::DOUBLE AS total
    FROM ${TABLE}
  `
}
