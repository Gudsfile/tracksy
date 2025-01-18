import { getDB } from '../getDB'
import { TABLE } from '../constants'

import * as arrow from 'apache-arrow'

const TRACK_METRICS_BY_DATE = `
SELECT
  ms_played,
  ts::date as ts,
  username
FROM ${TABLE}
order by ts
`

type QueryResult = {
    ms_played: arrow.Float
    ts: arrow.Date_
    username: arrow.Utf8
}

export async function queryDB() {
    const { conn } = await getDB()

    const results = await conn.query<QueryResult>(TRACK_METRICS_BY_DATE)
    return results
}
