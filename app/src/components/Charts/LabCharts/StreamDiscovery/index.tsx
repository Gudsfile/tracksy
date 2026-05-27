import { useState } from 'react'
import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import {
    queryStreamDiscovery,
    queryStreamDiscoveryStats,
    type EntityType,
    type StreamDiscoveryQueryResult,
    type StreamDiscoveryStatsQueryResult,
} from './query'
import { StreamDiscovery as StreamDiscoveryView } from './StreamDiscovery'
import { useGranularity } from '../shared/useGranularity'

interface StreamDiscoveryProps {
    year: number | undefined
}

export function StreamDiscovery({ year }: StreamDiscoveryProps) {
    const { setGranularity, availableGranularities, effectiveGranularity } =
        useGranularity(year)
    const [entity, setEntity] = useState<EntityType>('tracks')

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
