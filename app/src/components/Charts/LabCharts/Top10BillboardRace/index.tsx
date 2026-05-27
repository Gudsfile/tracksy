import { useEffect, useRef, useState } from 'react'
import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import {
    queryTop10BillboardRace,
    type Top10BillboardRaceQueryResult,
} from './query'
import type { EntityType } from '../shared/types'
import { Top10BillboardRaceView } from './Top10BillboardRaceView'
import { ChartCard } from '../../SimpleCharts/shared/ChartCard'
import { ChartCardEmpty } from '../../SimpleCharts/shared/ChartCardEmpty'
import { EntityTabs } from '../shared/EntityTabs'

export function Top10BillboardRace({ year }: { year: number | undefined }) {
    const [entityType, setEntityType] = useState<EntityType>('artists')

    const { data: rawData, isLoading } =
        useDBQueryMany<Top10BillboardRaceQueryResult>({
            query: queryTop10BillboardRace(year, entityType),
            year,
        })

    const data = rawData ?? []

    // Syncs committedEntityType only after new data arrives, preventing the race view
    // from rendering a stale entity label while the fetch is in flight.
    const prevDataRef = useRef(rawData)
    const [committedEntityType, setCommittedEntityType] =
        useState<EntityType>('artists')
    useEffect(() => {
        if (rawData !== prevDataRef.current) {
            prevDataRef.current = rawData
            setCommittedEntityType(entityType)
        }
    }, [rawData, entityType])

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
                        entityType={committedEntityType}
                    />
                </div>
            )}
        </ChartCard>
    )
}
