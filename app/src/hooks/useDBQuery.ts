import { useState, useEffect, useRef } from 'react'
import { queryDBCached, getCachedResult } from '../db/queries/queryDBCached'
import { DATA_LOADED_EVENT } from '../db/dataSignal'

type DBPrimitive = string | number | null
type DBRow = Record<string, DBPrimitive>

type BaseOptions = {
    query: string
    year?: number
}

export type UseDBQueryResult<T> = {
    data: T | undefined
    isLoading: boolean
    error: Error | undefined
}

export function useDBQueryMany<T extends DBRow>({
    query,
    year,
}: BaseOptions): UseDBQueryResult<T[]> {
    const cachedInitial = getCachedResult<T>(query)
    const [data, setData] = useState<T[] | undefined>(cachedInitial)
    const [isLoading, setIsLoading] = useState(cachedInitial === undefined)
    const [error, setError] = useState<Error | undefined>(undefined)
    const requestIdRef = useRef(0)
    const hasLoadedRef = useRef(cachedInitial !== undefined)
    const [triggerRefetch, setTriggerRefetch] = useState(0)

    useEffect(() => {
        const handleDataLoaded = () => {
            hasLoadedRef.current = false
            setTriggerRefetch((t) => t + 1)
        }
        window.addEventListener(DATA_LOADED_EVENT, handleDataLoaded)
        return () =>
            window.removeEventListener(DATA_LOADED_EVENT, handleDataLoaded)
    }, [])

    useEffect(() => {
        const id = ++requestIdRef.current

        const cached = getCachedResult<T>(query)
        if (cached) {
            setData(cached)
            setError(undefined)
            setIsLoading(false)
            hasLoadedRef.current = true
            return
        }

        const fetchData = async () => {
            setIsLoading(!hasLoadedRef.current)
            setError(undefined)

            try {
                const rows = await queryDBCached<T>(query)
                if (id === requestIdRef.current) {
                    setData(rows)
                    hasLoadedRef.current = true
                }
            } catch (e) {
                if (id === requestIdRef.current)
                    setError(
                        e instanceof Error ? e : new Error('Unknown error')
                    )
            } finally {
                if (id === requestIdRef.current) setIsLoading(false)
            }
        }

        fetchData()
    }, [query, year, triggerRefetch])

    return { data, isLoading, error }
}

export function useDBQueryFirst<T extends DBRow>(
    opts: BaseOptions
): UseDBQueryResult<T> {
    const { data, ...rest } = useDBQueryMany<T>(opts)
    return { data: data?.[0], ...rest }
}
