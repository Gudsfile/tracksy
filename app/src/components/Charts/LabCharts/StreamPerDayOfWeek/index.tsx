import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import {
    type StreamPerDayOfWeekQueryResult,
    streamPerDayOfWeekQueryByYear,
} from './query'
import { StreamPerDayOfWeekView } from './StreamPerDayOfWeekView'

interface StreamPerDayOfWeekProps {
    year: number | undefined
}

export function StreamPerDayOfWeek({ year }: StreamPerDayOfWeekProps) {
    const { data, isLoading } = useDBQueryMany<StreamPerDayOfWeekQueryResult>({
        query: streamPerDayOfWeekQueryByYear(year),
        year,
    })

    return (
        <StreamPerDayOfWeekView data={data} year={year} isLoading={isLoading} />
    )
}
