import { useState } from 'react'
import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import {
    queryStreamVariety,
    queryStreamVarietyStats,
    type Entity,
    type Granularity,
    type StreamVarietyQueryResult,
    type StreamVarietyStatsQueryResult,
} from './query'
import { StreamVariety as StreamVarietyView } from './StreamVariety'

const ALL_TIME_GRANULARITIES: Granularity[] = ['year', 'month']
const PER_YEAR_GRANULARITIES: Granularity[] = ['month', 'week', 'day']

interface StreamVarietyProps {
    year: number | undefined
}

export function StreamVariety({ year }: StreamVarietyProps) {
    const [granularity, setGranularity] = useState<Granularity>('month')
    const [entity, setEntity] = useState<Entity>('tracks')

    const availableGranularities =
        year !== undefined ? PER_YEAR_GRANULARITIES : ALL_TIME_GRANULARITIES

    // Avoids double-fetch: derived fallback instead of useEffect resetting granularity.
    const effectiveGranularity = availableGranularities.includes(granularity)
        ? granularity
        : availableGranularities[0]

    const { data, isLoading } = useDBQueryMany<StreamVarietyQueryResult>({
        query: queryStreamVariety(year, effectiveGranularity, entity),
        year,
    })

    const { data: statsData } = useDBQueryMany<StreamVarietyStatsQueryResult>({
        query: queryStreamVarietyStats(year, entity),
        year,
    })

    const stats = statsData?.[0]

    return (
        <StreamVarietyView
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
