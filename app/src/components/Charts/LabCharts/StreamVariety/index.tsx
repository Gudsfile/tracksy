import { useState } from 'react'
import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import {
    queryStreamVariety,
    queryStreamVarietyStats,
    type StreamVarietyQueryResult,
    type StreamVarietyStatsQueryResult,
} from './query'
import { StreamVariety as StreamVarietyView } from './StreamVariety'
import { useGranularity } from '../shared/useGranularity'
import type { EntityType } from '../types'

interface StreamVarietyProps {
    year: number | undefined
}

export function StreamVariety({ year }: StreamVarietyProps) {
    const { setGranularity, availableGranularities, effectiveGranularity } =
        useGranularity(year)
    const [entity, setEntity] = useState<EntityType>('tracks')

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
