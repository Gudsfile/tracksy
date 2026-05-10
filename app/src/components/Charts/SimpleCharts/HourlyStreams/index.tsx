import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { buildHourlyStreamsQuery, type HourlyStreamsQueryResult } from './query'
import { HourlyStreams as HourlyStreamsView } from './HourlyStreams'

interface HourlyStreamsProps {
    year: number | undefined
    maxHourlyCount: number
}

export function HourlyStreams({ year, maxHourlyCount }: HourlyStreamsProps) {
    const { data, isLoading } = useDBQueryMany<HourlyStreamsQueryResult>({
        query: buildHourlyStreamsQuery(year),
        year,
    })

    return (
        <HourlyStreamsView
            data={data}
            maxHourlyCount={maxHourlyCount}
            isLoading={isLoading}
        />
    )
}
