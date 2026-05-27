import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import {
    queryTop10Race,
    type EntityType,
    type Top10RaceQueryResult,
} from './query'
import { Top10RaceView } from './Top10RaceView'
import { ChartCard, ChartCardEmpty } from '../../SimpleCharts/shared'
import { EntityTabs } from '../shared/EntityTabs'

export function Top10Race({ year }: { year: number | undefined }) {
    const [data, setData] = useState<Top10RaceQueryResult[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [entityType, setEntityType] = useState<EntityType>('artists')
    const [dataEntityType, setDataEntityType] = useState<EntityType>('artists')

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const result = await queryDBAsJSON<Top10RaceQueryResult>(
                    queryTop10Race(year, entityType)
                )
                setData(result || [])
                setDataEntityType(entityType)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [year, entityType])

    const isInitialLoad = isLoading && data.length === 0

    return (
        <ChartCard
            title="Top 10 Race"
            emoji="🏎️"
            className="md:col-span-2 lg:col-span-3"
            isLoading={isInitialLoad}
            question="Who dominated my listening, and when did they rise?"
            headerActions={
                <EntityTabs value={entityType} onChange={setEntityType} />
            }
        >
            {data.length === 0 ? (
                <ChartCardEmpty />
            ) : (
                <div
                    className="transition-opacity duration-150"
                    style={{ opacity: isLoading ? 0.4 : 1 }}
                >
                    <Top10RaceView data={data} entityType={dataEntityType} />
                </div>
            )}
        </ChartCard>
    )
}
