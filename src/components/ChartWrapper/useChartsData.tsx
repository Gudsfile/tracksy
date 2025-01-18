import { useEffect, useState } from 'react'

import { queryDB } from '../../db/queries/queryDB'
import { retrieveJSON } from '../../db/storage/retriveJSON'
import { insertDataInDatabase } from '../../db/commands/insertDataInDatabase'
import { SESSION_STORAGE_KEY } from '../../db/constants'

/**
 * Custom hook to fetch chart data from a database and manage loading and error states.
 *
 * @param {Object} params - The parameters object.
 * @param {Function} [params.onSuccess] - Optional callback function to be called on successful data retrieval.
 * @param {Function} [params.onFail] - Optional callback function to be called on data retrieval failure.
 *
 * @returns {Object} An object containing the following properties:
 * - `data`: The fetched chart data or `undefined` if not yet available.
 * - `isLoading`: A boolean indicating whether the data is currently being loaded.
 * - `error`: An `Error` object if an error occurred during data retrieval, otherwise `undefined`.
 */
export function useChartsData({
    onSuccess,
    onFail,
}: {
    onSuccess?: () => void
    onFail?: () => void
}) {
    const [data, setData] = useState<
        Awaited<ReturnType<typeof queryDB>> | undefined
    >()

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | undefined>()

    useEffect(() => {
        const getChartData = async () => {
            setIsLoading(true)
            try {
                const datasets =
                    retrieveJSON<Record<string, unknown>[]>(SESSION_STORAGE_KEY)
                if (datasets !== null) {
                    await insertDataInDatabase(datasets)
                    const result = await queryDB()
                    setData(result)
                    onSuccess?.()
                } else {
                    onFail?.()
                }
            } catch (error) {
                console.error(error)
                setError(error as Error)
                onFail?.()
            } finally {
                setIsLoading(false)
            }
        }
        getChartData()
    }, [])

    return { data, isLoading, error }
}
