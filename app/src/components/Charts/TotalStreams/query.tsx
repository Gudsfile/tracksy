import { TABLE } from '../../../db/queries/constants'

export function query() {
    return `
SELECT
  COUNT(*)::INTEGER AS count_streams,
  SUM(ms_played) AS ms_played
FROM ${TABLE}
`
}

export type QueryResult = {
    count_streams: number
    ms_played: number
}
