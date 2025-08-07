import { getDB } from '../getDB'
import { TABLE, DROP_TABLE_QUERY } from './constants'

export async function insertUrlInDatabase(jsonUrl: URL) {
    const { conn } = await getDB()
    await conn.query(DROP_TABLE_QUERY)
    await conn.insertJSONFromPath(jsonUrl.toString(), { name: TABLE })
}
