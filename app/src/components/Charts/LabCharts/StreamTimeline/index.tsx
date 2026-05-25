import { useState } from 'react'
import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import {
    queryStreamTimeline,
    type Granularity,
    type StreamTimelineQueryResult,
} from './query'
import { StreamTimeline as StreamTimelineView } from './StreamTimeline'

const ALL_TIME_GRANULARITIES: Granularity[] = ['year', 'month']
const PER_YEAR_GRANULARITIES: Granularity[] = ['month', 'week', 'day']

interface StreamTimelineProps {
    year: number | undefined
}

export function StreamTimeline({ year }: StreamTimelineProps) {
    const [granularity, setGranularity] = useState<Granularity>('month')

    const availableGranularities =
        year !== undefined ? PER_YEAR_GRANULARITIES : ALL_TIME_GRANULARITIES

    // Avoids double-fetch: derived fallback instead of useEffect resetting granularity.
    const effectiveGranularity = availableGranularities.includes(granularity)
        ? granularity
        : 'month'

    const { data, isLoading } = useDBQueryMany<StreamTimelineQueryResult>({
        query: queryStreamTimeline(year, effectiveGranularity),
        year,
    })

    return (
        <StreamTimelineView
            data={data}
            year={year}
            granularity={effectiveGranularity}
            availableGranularities={availableGranularities}
            onGranularityChange={setGranularity}
            isLoading={isLoading}
        />
    )
}
