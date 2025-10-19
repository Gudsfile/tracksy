import { QueryResult, query } from './query'
import { TopStreak as TopStreakPlot } from './TopStreak'
import { queryDBAsJSON } from '../../../db/queries/queryDB'
import { useState, useEffect } from 'react'

export function TopStreak() {
    const [data, setData] = useState<QueryResult[] | undefined>()

    useEffect(() => {
        const getData = async () => {
            const result = await queryDBAsJSON<QueryResult>(query())
            setData(result)
        }
        getData()
    }, [query])

    console.log('streaks: ', data)
    if (!data) return <></>

    return (
        <div className="p-4 my-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <TopStreakPlot data={data} />
        </div>
    )
}
