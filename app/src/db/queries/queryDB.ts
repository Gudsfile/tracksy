import { getDB } from '../getDB'

export async function queryDBAsJSON<
    T extends Record<string, string | number | null>,
>(query: string): Promise<T[]> {
    const { conn } = await getDB()
    const table = await conn.query(query)
    const jsonResult = table.toArray().map((row) => row.toJSON())
    return jsonResult as T[]
}
