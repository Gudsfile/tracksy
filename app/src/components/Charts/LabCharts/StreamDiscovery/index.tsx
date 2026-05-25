import { useState } from 'react'
import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import {
    queryStreamDiscovery,
    queryStreamDiscoveryStats,
    type Entity,
    type Granularity,
    type StreamDiscoveryQueryResult,
    type StreamDiscoveryStatsQueryResult,
} from './query'
import { StreamDiscovery as StreamDiscoveryView } from './StreamDiscovery'

const ALL_TIME_GRANULARITIES: Granularity[] = ['year', 'month']
const PER_YEAR_GRANULARITIES: Granularity[] = ['month', 'week', 'day']

interface StreamDiscoveryProps {
    year: number | undefined
}

export function StreamDiscovery({ year }: StreamDiscoveryProps) {
    const [granularity, setGranularity] = useState<Granularity>('month')
    const [entity, setEntity] = useState<Entity>('tracks')

    const availableGranularities =
        year !== undefined ? PER_YEAR_GRANULARITIES : ALL_TIME_GRANULARITIES

    // Avoids double-fetch: derived fallback instead of useEffect resetting granularity.
    const effectiveGranularity = availableGranularities.includes(granularity)
        ? granularity
        : availableGranularities[0]

    const { data, isLoading } = useDBQueryMany<StreamDiscoveryQueryResult>({
        query: queryStreamDiscovery(year, effectiveGranularity, entity),
        year,
    })

    const { data: statsData } = useDBQueryMany<StreamDiscoveryStatsQueryResult>(
        {
            query: queryStreamDiscoveryStats(year, entity),
            year,
        }
    )

    const stats = statsData?.[0]

    return (
        <StreamDiscoveryView
            data={data}
            stats={stats}
            year={year}
            granularity={effectiveGranularity}
            availableGranularities={availableGranularities}
            onGranularityChange={setGranularity}
            entity={entity}
            onEntityChange={setEntity}
            isLoading={isLoading}
        />
    )
}
