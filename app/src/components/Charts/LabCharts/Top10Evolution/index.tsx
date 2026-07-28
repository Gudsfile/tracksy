import { useEffect, useState } from 'react'
import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryTop10Evolution, type Top10EvolutionQueryResult } from './query'
import { Top10EvolutionPlot } from './plot'
import { ChartCardEmpty } from '../../SimpleCharts/shared/ChartCardEmpty'

export function Top10Evolution() {
    const [data, setData] = useState<Top10EvolutionQueryResult[] | undefined>()

    useEffect(() => {
        const fetchData = async () => {
            const result = useDBQueryMany<Top10EvolutionQueryResult>({
                query: queryTop10Evolution(),
            })
            setData(result.data)
        }
        fetchData()
    }, [])

    if (!data || data.length === 0) {
        return (
            <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
                <ChartCardEmpty />
            </div>
        )
    }

    return (
        <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <Top10EvolutionPlot data={data} />
        </div>
    )
}
