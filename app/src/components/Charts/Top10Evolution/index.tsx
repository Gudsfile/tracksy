import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../db/queries/queryDB'
import { queryTop10Evolution, type Top10EvolutionQueryResult } from './query'
import { Top10EvolutionPlot } from './plot'

export function Top10Evolution() {
    const [data, setData] = useState<Top10EvolutionQueryResult[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const result = await queryDBAsJSON<Top10EvolutionQueryResult>(
                queryTop10Evolution()
            )
            setData(result)
        }
        fetchData()
    }, [])

    if (data.length === 0) return null

    return (
        <div className="relative p-4 my-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <Top10EvolutionPlot data={data} />
        </div>
    )
}
