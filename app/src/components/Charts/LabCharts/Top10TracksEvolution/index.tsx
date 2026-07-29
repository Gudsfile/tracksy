import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { DATA_LOADED_EVENT } from '../../../../db/dataSignal'
import {
    queryTop10TracksEvolution,
    type Top10TracksEvolutionQueryResult,
} from './query'
import { Top10TracksEvolutionPlot } from './plot'
import { ChartCardEmpty } from '../../SimpleCharts/shared/ChartCardEmpty'

const cardClassName =
    'group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in'

export function Top10TracksEvolution() {
    const [data, setData] = useState<
        Top10TracksEvolutionQueryResult[] | undefined
    >()
    const [error, setError] = useState<string | undefined>(undefined)

    useEffect(() => {
        let ignore = false

        const fetchData = async () => {
            setError(undefined)
            try {
                const result =
                    await queryDBAsJSON<Top10TracksEvolutionQueryResult>(
                        queryTop10TracksEvolution()
                    )
                if (!ignore) setData(result)
            } catch (err) {
                console.error('Error loading Top 10 tracks evolution:', err)
                if (!ignore)
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Failed to load chart data'
                    )
            }
        }

        fetchData()

        const handleDataLoaded = () => {
            fetchData()
        }
        window.addEventListener(DATA_LOADED_EVENT, handleDataLoaded)

        return () => {
            ignore = true
            window.removeEventListener(DATA_LOADED_EVENT, handleDataLoaded)
        }
    }, [])

    if (error) {
        return (
            <div className={cardClassName}>
                <ChartCardEmpty message={error} />
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className={cardClassName}>
                <ChartCardEmpty />
            </div>
        )
    }

    return (
        <div className={cardClassName}>
            <Top10TracksEvolutionPlot data={data} />
        </div>
    )
}
