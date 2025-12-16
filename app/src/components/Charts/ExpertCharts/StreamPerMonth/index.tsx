import {
    type StreamPerMonthQueryResult,
    queryStreamsPerMonthByYear,
} from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'
import { useCallback } from 'react'

interface StreamPerMonthProps {
    year: number
    maxValue: number
}

export function StreamPerMonth({ year, maxValue }: StreamPerMonthProps) {
    const plotBuilder = useCallback(
        (data: StreamPerMonthQueryResult[], isDark: boolean | undefined) =>
            buildPlot(data, maxValue, isDark),
        [maxValue]
    )
    return (
        <Common<StreamPerMonthQueryResult>
            query={queryStreamsPerMonthByYear(year)}
            buildPlot={plotBuilder}
        />
    )
}
