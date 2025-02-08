import { getDB } from '../getDB'

import * as arrow from 'apache-arrow'

export type QueryResult = {
    ms_played: arrow.Float
    ts: arrow.Date_
    username: arrow.Utf8
}

export async function queryDB(query: string) {
    const { conn } = await getDB()

    const results = await conn.query<QueryResult>(query)
    return results
}
