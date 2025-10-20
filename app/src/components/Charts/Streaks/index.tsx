import { type StreaksQueryResult, queryStreaks } from './query'
import { Streaks as StreaksPlot } from './Streaks'
import { queryDBAsJSON } from '../../../db/queries/queryDB'
import { useState, useEffect } from 'react'

export function Streaks() {
    const [data, setData] = useState<StreaksQueryResult[] | undefined>()

    useEffect(() => {
        const fetchStreaks = async () => {
            const result =
                await queryDBAsJSON<StreaksQueryResult>(queryStreaks())
            setData(result)
        }
        fetchStreaks()
    }, [])

    if (!data) return <></>

    return (
        <div className="relative p-4 my-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <StreaksPlot data={data} />
        </div>
    )
}
