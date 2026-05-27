import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryStreamTimeline, type StreamTimelineQueryResult } from './query'
import { StreamTimeline as StreamTimelineView } from './StreamTimeline'
import { useGranularity } from '../shared/useGranularity'

interface StreamTimelineProps {
    year: number | undefined
}

export function StreamTimeline({ year }: StreamTimelineProps) {
    const { setGranularity, availableGranularities, effectiveGranularity } =
        useGranularity(year)

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
