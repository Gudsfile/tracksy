import { type TotalStreamsQueryResult, queryTotalStreams } from './query'
import { queryDBAsJSON } from '../../../db/queries/queryDB'
import { useState, useEffect } from 'react'
import { TotalStreams as TotalStreamsPlot } from './TotalStreams'

export function TotalStreams() {
    const [data, setData] = useState<TotalStreamsQueryResult[] | undefined>()

    useEffect(() => {
        const getData = async () => {
            const result =
                await queryDBAsJSON<TotalStreamsQueryResult>(
                    queryTotalStreams()
                )
            setData(result)
        }
        getData()
    }, [queryTotalStreams])

    if (!data) return <></>

    return (
        <div className="flex-1 min-w-0 w-full p-4 my-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <TotalStreamsPlot data={data} />
        </div>
    )
}
