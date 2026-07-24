import { queryDBAsJSON } from './queryDB'
import { DATA_LOADED_EVENT } from '../dataSignal'

type DBRow = Record<string, string | number | null | undefined>

const inFlight = new Map<string, Promise<unknown[]>>()
const resolved = new Map<string, unknown[]>()

if (typeof window !== 'undefined') {
    window.addEventListener(DATA_LOADED_EVENT, () => {
        inFlight.clear()
        resolved.clear()
    })
}

export function getCachedResult<T extends DBRow>(sql: string): T[] | undefined {
    return resolved.get(sql) as T[] | undefined
}

export function queryDBCached<T extends DBRow>(sql: string): Promise<T[]> {
    const cached = resolved.get(sql)
    if (cached) return Promise.resolve(cached as T[])

    const ongoing = inFlight.get(sql) as Promise<T[]> | undefined
    if (ongoing) return ongoing

    const promise = queryDBAsJSON<T>(sql)
        .then((rows) => {
            resolved.set(sql, rows)
            inFlight.delete(sql)
            return rows
        })
        .catch((e) => {
            inFlight.delete(sql)
            throw e
        })

    inFlight.set(sql, promise)
    return promise
}

export function clearQueryCache(): void {
    inFlight.clear()
    resolved.clear()
}
