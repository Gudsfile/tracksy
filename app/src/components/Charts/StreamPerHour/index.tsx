import {
    type StreamPerHourQueryResult,
    queryStreamsPerHoursByYear,
} from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'
import { useCallback } from 'react'

interface StreamPerHourProps {
    year: number
    maxValue: number
}

export function StreamPerHour({ year, maxValue }: StreamPerHourProps) {
    const plotBuilder = useCallback(
        (data: StreamPerHourQueryResult[], isDark: boolean | undefined) =>
            buildPlot(data, maxValue, isDark),
        [maxValue]
    )

    return (
        <Common<StreamPerHourQueryResult>
            query={queryStreamsPerHoursByYear(year)}
            buildPlot={plotBuilder}
        />
    )
}
