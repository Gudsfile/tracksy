import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import {
    queryTop10BillboardRace,
    type EntityType,
    type Top10BillboardRaceQueryResult,
} from './query'
import { Top10BillboardRaceView } from './Top10BillboardRaceView'
import { ChartCard, ChartCardEmpty } from '../../SimpleCharts/shared'

export function Top10BillboardRace({ year }: { year: number | undefined }) {
    const [data, setData] = useState<Top10BillboardRaceQueryResult[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [entityType, setEntityType] = useState<EntityType>('artists')

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const result =
                    await queryDBAsJSON<Top10BillboardRaceQueryResult>(
                        queryTop10BillboardRace(year, entityType)
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
                        ? 'Artists'
                        : type === 'tracks'
                          ? 'Tracks'
                          : 'Albums'}
                </button>
            ))}
        </div>
    )

    return (
        <ChartCard
            title="Top 10 Billboard Race"
            emoji="🏎️"
            className="md:col-span-2 lg:col-span-3"
            isLoading={isLoading}
            question="Who stayed in the charts the longest week after week?"
            headerActions={entityTabs}
        >
            {data.length === 0 ? (
                <ChartCardEmpty />
            ) : (
                <Top10BillboardRaceView data={data} entityType={entityType} />
            )}
        </ChartCard>
    )
}
