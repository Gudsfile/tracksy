import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import {
    queryTop10Race,
    type EntityType,
    type Top10RaceQueryResult,
} from './query'
import { Top10RaceView } from './Top10RaceView'
import { ChartCard, ChartCardEmpty } from '../../SimpleCharts/shared'

export function Top10Race({ year }: { year: number | undefined }) {
    const [data, setData] = useState<Top10RaceQueryResult[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [entityType, setEntityType] = useState<EntityType>('artists')

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const result = await queryDBAsJSON<Top10RaceQueryResult>(
                    queryTop10Race(year, entityType)
                )
                setData(result || [])
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [year, entityType])

    const entityTabs = (
        <div className="flex items-center bg-gray-100 dark:bg-slate-800/80 rounded-lg p-1 border border-gray-300/30">
            {(['artists', 'tracks', 'albums'] as const).map((type) => (
                <button
                    key={type}
                    onClick={() => setEntityType(type)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                        entityType === type
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    {type === 'artists'
                        ? 'Artistes'
                        : type === 'tracks'
                          ? 'Titres'
                          : 'Albums'}
                </button>
            ))}
        </div>
    )

    return (
        <ChartCard
            title="Top 10 Race"
            emoji="🏎️"
            className="mt-4 md:col-span-2 lg:col-span-3"
            isLoading={isLoading}
            question="Who dominated my listening, and when did they rise?"
            headerActions={entityTabs}
        >
            {data.length === 0 ? (
                <ChartCardEmpty />
            ) : (
                <Top10RaceView data={data} entityType={entityType} />
            )}
        </ChartCard>
    )
}
