import { TABLE } from '../../../db/queries/constants'

export function queryTotalStreams() {
    return `
SELECT
  COUNT(*)::INTEGER AS count_streams,
  SUM(ms_played)::DOUBLE AS ms_played
FROM ${TABLE}
`
}

export type TotalStreamsQueryResult = {
    count_streams: number
    ms_played: number
}
