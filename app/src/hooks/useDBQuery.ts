import { useState, useEffect } from 'react'
import { queryDBAsJSON } from '../db/queries/queryDB'

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
    const [data, setData] = useState<T[] | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | undefined>(undefined)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            setError(undefined)

            try {
                const rows = await queryDBAsJSON<T>(query)
                setData(rows)
            } catch (e) {
                setError(e instanceof Error ? e : new Error('Unknown error'))
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [query, year])

    return { data, isLoading, error }
}

export function useDBQueryFirst<T extends DBRow>({
    query,
    year,
}: BaseOptions): UseDBQueryResult<T> {
    const [data, setData] = useState<T | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | undefined>(undefined)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            setError(undefined)

            try {
                const rows = await queryDBAsJSON<T>(query)
                setData(rows[0])
            } catch (e) {
                setError(e instanceof Error ? e : new Error('Unknown error'))
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [query, year])

    return { data, isLoading, error }
}
