import { getDB } from '../getDB'
import { devBus } from '../../devToolbar/devBus'

export async function queryDBAsJSON<
    T extends Record<string, string | number | null | undefined>,
>(query: string): Promise<T[]> {
    const { conn } = await getDB()
    const start = performance.now()
    try {
        const table = await conn.query(query)
        const jsonResult = table.toArray().map((row) => row.toJSON())
        devBus.emit('duckdb:query', {
            sql: query,
            durationMs: performance.now() - start,
            rowCount: jsonResult.length,
        })
        return jsonResult as T[]
    } catch (e) {
        devBus.emit('duckdb:query', {
            sql: query,
            durationMs: performance.now() - start,
            rowCount: 0,
            error: String(e),
        })
        throw e
    }
}
