import { useState } from 'react'

export type Granularity = 'year' | 'month' | 'week' | 'day'

const ALL_TIME_GRANULARITIES: Granularity[] = ['year', 'month']
const PER_YEAR_GRANULARITIES: Granularity[] = ['month', 'week', 'day']

type UseGranularityResult = {
    granularity: Granularity
    setGranularity: (g: Granularity) => void
    availableGranularities: Granularity[]
    effectiveGranularity: Granularity
}

export function useGranularity(year: number | undefined): UseGranularityResult {
    const [granularity, setGranularity] = useState<Granularity>('month')

    const availableGranularities =
        year !== undefined ? PER_YEAR_GRANULARITIES : ALL_TIME_GRANULARITIES

    const effectiveGranularity = availableGranularities.includes(granularity)
        ? granularity
        : availableGranularities[0]

    return {
        granularity,
        setGranularity,
        availableGranularities,
        effectiveGranularity,
    }
}
