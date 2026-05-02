import { getDB } from '../getDB'

export async function queryDBAsJSON<
    T extends Record<string, string | number | null>,
>(query: string, params: unknown[] = []): Promise<T[]> {
    const { conn } = await getDB()
    let table
    if (params.length > 0) {
        const stmt = await conn.prepare(query)
        try {
            table = await stmt.query(...params)
        } finally {
            await stmt.close()
        }
    } else {
        table = await conn.query(query)
    }
    const jsonResult = table.toArray().map((row) => row.toJSON())
    return jsonResult as T[]
}
