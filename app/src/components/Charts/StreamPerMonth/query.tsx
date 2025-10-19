import { TABLE } from '../../../db/queries/constants'

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
    ms_played: number
    ts: number
}
