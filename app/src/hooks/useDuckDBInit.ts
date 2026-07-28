import { useCallback, useEffect, useState } from 'react'
import { getDB } from '../db/getDB'
import type { DuckdbApp, DuckdbInitProgress } from '../db/setupDB'

type UseDuckDBInitOptions = {
    /** Test seam: skip initialization by supplying an already-booted instance. */
    initialDb?: DuckdbApp | null
}

/**
 * Boots DuckDB WASM once and exposes its progress so the UI can show a real
 * loader instead of a static message. Booting is the slowest thing the app does
 * on a cold visit — the .wasm bundle is ~33 MB.
 */
export function useDuckDBInit({ initialDb = null }: UseDuckDBInitOptions = {}) {
    const [db, setDb] = useState<DuckdbApp | null>(initialDb)
    const [progress, setProgress] = useState<DuckdbInitProgress | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        if (initialDb) return

        // Guards every setState below: without it a failure that resolves after
        // unmount would warn, and a retry could be overwritten by its predecessor.
        let active = true

        setError(null)
        setProgress(null)

        getDB((next) => {
            if (active) setProgress(next)
        })
            .then((instance) => {
                if (active) setDb(instance)
            })
            .catch((cause: unknown) => {
                if (!active) return
                console.error('Failed to initialize DuckDB:', cause)
                setError(
                    cause instanceof Error ? cause : new Error(String(cause))
                )
            })

        return () => {
            active = false
        }
    }, [initialDb, attempt])

    const retry = useCallback(() => setAttempt((n) => n + 1), [])

    return {
        db,
        stage: progress?.stage ?? null,
        percent: progress?.percent ?? null,
        error,
        retry,
    }
}
