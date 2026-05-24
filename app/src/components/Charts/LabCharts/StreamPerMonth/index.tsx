import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import {
    queryStreamsPerMonthByYear,
    type StreamPerMonthQueryResult,
} from './query'
import { StreamPerMonth as StreamPerMonthView } from './StreamPerMonth'

interface StreamPerMonthProps {
    year: number | undefined
    maxValue: number
}

export function StreamPerMonth({ year, maxValue }: StreamPerMonthProps) {
    const { data, isLoading } = useDBQueryMany<StreamPerMonthQueryResult>({
        query: queryStreamsPerMonthByYear(year),
        year,
    })

    return (
        <StreamPerMonthView
            data={data}
            year={year}
            maxValue={maxValue}
            isLoading={isLoading}
        />
    )
}
