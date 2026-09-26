import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import {
    queryTop10AlbumsEvolution,
    type Top10AlbumsEvolutionQueryResult,
} from './query'
import { Top10AlbumsEvolutionPlot } from './plot'
import { ChartCardEmpty } from '../../SimpleCharts/shared/ChartCardEmpty'

const cardClassName =
    'group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in'

export function Top10AlbumsEvolution() {
    const { data, error } = useDBQueryMany<Top10AlbumsEvolutionQueryResult>({
        query: queryTop10AlbumsEvolution(),
    })

    if (error) {
        return (
            <div className={cardClassName}>
                <ChartCardEmpty message={error.message} />
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
            <Top10AlbumsEvolutionPlot data={data} />
        </div>
    )
}
