import { useEffect, useState, useRef } from 'react'
import { queryTop10Race, type Top10RaceQueryResult } from './query'
import type { EntityType } from '../shared/types'
import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { Top10RaceView } from './Top10RaceView'
import { ChartCard } from '../../SimpleCharts/shared/ChartCard'
import { ChartCardEmpty } from '../../SimpleCharts/shared/ChartCardEmpty'
import { EntityTabs } from '../shared/EntityTabs'

export function Top10Race({ year }: { year: number | undefined }) {
    const [entityType, setEntityType] = useState<EntityType>('artists')

    const { data: rawData, isLoading } = useDBQueryMany<Top10RaceQueryResult>({
        query: queryTop10Race(year, entityType),
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
                    <Top10RaceView
                        data={data}
                        entityType={committedEntityType}
                    />
                </div>
            )}
        </ChartCard>
    )
}
