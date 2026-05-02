import {
    type StreamPerMonthQueryResult,
    queryStreamsPerMonthByYear,
} from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'
import { useCallback } from 'react'

interface StreamPerMonthProps {
    year: number | undefined
    maxValue: number
}

export function StreamPerMonth({ year, maxValue }: StreamPerMonthProps) {
    const plotBuilder = useCallback(
        (data: StreamPerMonthQueryResult[], isDark: boolean | undefined) =>
            buildPlot(data, maxValue, isDark),
        [maxValue]
    )
    const { sql, params } = queryStreamsPerMonthByYear(year)
    return (
        <Common<StreamPerMonthQueryResult>
            query={sql}
            params={params}
            buildPlot={plotBuilder}
        />
    )
}
