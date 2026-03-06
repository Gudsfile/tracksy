import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import {
    queryTop10TracksEvolution,
    type Top10TracksEvolutionQueryResult,
} from './query'
import { Top10TracksEvolutionPlot } from './plot'

export function Top10TracksEvolution() {
    const [data, setData] = useState<Top10TracksEvolutionQueryResult[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const result = await queryDBAsJSON<Top10TracksEvolutionQueryResult>(
                queryTop10TracksEvolution()
            )
            setData(result)
        }
        fetchData()
    }, [])

    if (data.length === 0) return null

    return (
        <div className="group p-6 my-4 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <Top10TracksEvolutionPlot data={data} />
        </div>
    )
}
