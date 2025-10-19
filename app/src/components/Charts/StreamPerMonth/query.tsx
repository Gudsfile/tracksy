import { TABLE } from '../../../db/queries/constants'
import type { Float, Date_ } from 'apache-arrow'

export function queryByYear(year: number | undefined) {
    return `
SELECT
  ms_played,
  ts::DATE AS ts
FROM ${TABLE}
${year ? `WHERE YEAR(ts::DATETIME) = ${year}` : ''}
ORDER BY ts
`
}

export type QueryResult = {
    ms_played: Float
    ts: Date_
}
