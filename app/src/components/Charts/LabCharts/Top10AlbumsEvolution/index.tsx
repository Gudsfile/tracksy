import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import {
    queryTop10AlbumsEvolution,
    type Top10AlbumsEvolutionQueryResult,
} from './query'
import { Top10AlbumsEvolutionPlot } from './plot'
import { ChartCardEmpty } from '../../SimpleCharts/shared/ChartCardEmpty'

export function Top10AlbumsEvolution() {
    const [data, setData] = useState<Top10AlbumsEvolutionQueryResult[]>([])
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result =
                    await queryDBAsJSON<Top10AlbumsEvolutionQueryResult>(
                        queryTop10AlbumsEvolution()
                    )
                setData(result)
            } catch (error) {
                console.error('Error loading Top 10 albums evolution:', error)
                setHasError(true)
            }
        }
        fetchData()
    }, [])

    if (hasError) {
        return (
            <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
                <ChartCardEmpty message="Failed to load chart data" />
            </div>
        )
    }

    if (data.length === 0) return null

    return (
        <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <Top10AlbumsEvolutionPlot data={data} />
        </div>
    )
}
