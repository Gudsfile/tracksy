import { getDB } from '../getDB'
import { devBus } from '../../devToolbar/devBus'
import { parseCallerFrame } from '../../devToolbar/parseCallerFrame'

export async function queryDBAsJSON<
    T extends Record<string, string | number | null | undefined>,
>(query: string, source?: string): Promise<T[]> {
    const resolvedSource =
        source ??
        (import.meta.env.DEV ? parseCallerFrame(new Error().stack) : undefined)
    const { conn } = await getDB()
    const start = performance.now()
    try {
        const table = await conn.query(query)
        const jsonResult = table.toArray().map((row) => row.toJSON())
        devBus.emit('duckdb:query', {
            sql: query,
            durationMs: performance.now() - start,
            rowCount: jsonResult.length,
            source: resolvedSource,
        })
        return jsonResult as T[]
    } catch (e) {
        devBus.emit('duckdb:query', {
            sql: query,
            durationMs: performance.now() - start,
            rowCount: 0,
            source: resolvedSource,
            error: String(e),
        })
        throw e
    }
}
