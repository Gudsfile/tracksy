import { TABLE } from '../../../../db/queries/constants'

export type ListeningRhythmResult = {
    morning: number
    afternoon: number
    evening: number
    night: number
    total: number
}

export function queryListeningRhythm(): string {
    return `
  SELECT
    SUM(CASE WHEN HOUR(ts:: TIMESTAMP) >= 6 AND HOUR(ts:: TIMESTAMP) < 12 THEN 1 ELSE 0 END)::DOUBLE AS morning,
    SUM(CASE WHEN HOUR(ts:: TIMESTAMP) >= 12 AND HOUR(ts:: TIMESTAMP) < 18 THEN 1 ELSE 0 END)::DOUBLE AS afternoon,
    SUM(CASE WHEN HOUR(ts:: TIMESTAMP) >= 18 AND HOUR(ts:: TIMESTAMP) < 22 THEN 1 ELSE 0 END)::DOUBLE AS evening,
    SUM(CASE WHEN HOUR(ts:: TIMESTAMP) >= 22 OR HOUR(ts:: TIMESTAMP) < 6 THEN 1 ELSE 0 END)::DOUBLE AS night,
    COUNT(*)::DOUBLE AS total
  FROM ${TABLE}
  `
}
