import { TABLE } from '../../../../db/queries/constants'

export type EvolutionResult = {
    year: number
    streams: number
}

export function queryEvolutionOverTime(): string {
    return `
    SELECT
      YEAR(ts::DATE)::INTEGER as year,
      COUNT(*)::DOUBLE as streams
    FROM ${TABLE}
    GROUP BY YEAR(ts::DATE)
    ORDER BY YEAR(ts::DATE)
  `
}
