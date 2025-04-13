import { TABLE } from '../../../db/queries/constants'
import type { Float, Date_, Utf8 } from 'apache-arrow'

export const query = `
SELECT
  ms_played,
  ts::date as ts,
  username
FROM ${TABLE}
order by ts
`

export type QueryResult = {
    ms_played: Float
    ts: Date_
    username: Utf8
}
