import { useState } from 'react'
import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import {
    queryStreamsPerMonth,
    type Granularity,
    type StreamPerMonthQueryResult,
} from './query'
import { StreamPerMonth as StreamPerMonthView } from './StreamPerMonth'

const ALL_TIME_GRANULARITIES: Granularity[] = ['year', 'month']
const PER_YEAR_GRANULARITIES: Granularity[] = ['month', 'week', 'day']

interface StreamPerMonthProps {
    year: number | undefined
}

export function StreamPerMonth({ year }: StreamPerMonthProps) {
    const [granularity, setGranularity] = useState<Granularity>('month')

    const availableGranularities =
        year !== undefined ? PER_YEAR_GRANULARITIES : ALL_TIME_GRANULARITIES

    // Avoids double-fetch: derived fallback instead of useEffect resetting granularity.
    const effectiveGranularity = availableGranularities.includes(granularity)
        ? granularity
        : 'month'

    const { data, isLoading } = useDBQueryMany<StreamPerMonthQueryResult>({
        query: queryStreamsPerMonth(year, effectiveGranularity),
        year,
    })

    return (
        <StreamPerMonthView
            data={data}
            year={year}
            granularity={effectiveGranularity}
            availableGranularities={availableGranularities}
            onGranularityChange={setGranularity}
            isLoading={isLoading}
        />
    )
}
