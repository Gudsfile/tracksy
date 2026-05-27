import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import {
    queryTop10BillboardRace,
    type Top10BillboardRaceQueryResult,
} from './query'
import type { EntityType } from '../shared/types'
import { Top10BillboardRaceView } from './Top10BillboardRaceView'
import { ChartCard, ChartCardEmpty } from '../../SimpleCharts/shared'
import { EntityTabs } from '../shared/EntityTabs'

export function Top10BillboardRace({ year }: { year: number | undefined }) {
    const [data, setData] = useState<Top10BillboardRaceQueryResult[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [entityType, setEntityType] = useState<EntityType>('artists')
    const [dataEntityType, setDataEntityType] = useState<EntityType>('artists')

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const result =
                    await queryDBAsJSON<Top10BillboardRaceQueryResult>(
                        queryTop10BillboardRace(year, entityType)
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
            title="Top 10 Billboard"
            emoji="🏆"
            className="md:col-span-2 lg:col-span-3"
            isLoading={isInitialLoad}
            question="Who stayed in the charts the longest week after week?"
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
                    <Top10BillboardRaceView
                        data={data}
                        entityType={dataEntityType}
                    />
                </div>
            )}
        </ChartCard>
    )
}
