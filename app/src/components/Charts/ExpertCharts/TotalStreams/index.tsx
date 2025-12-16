import { type TotalStreamsQueryResult, queryTotalStreams } from './query'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
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
        <div className="group flex-1 p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 shadow-glass hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <TotalStreamsPlot data={data} />
        </div>
    )
}
