import {
    type StreamPerDayOfWeekQueryResult,
    streamPerDayOfWeekQueryByYear,
} from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'
import { useCallback } from 'react'

interface StreamPerDayOfWeekProps {
    year: number
}

export function StreamPerDayOfWeek({ year }: StreamPerDayOfWeekProps) {
    const plotBuilder = useCallback(
        (data: StreamPerDayOfWeekQueryResult[], isDark: boolean | undefined) =>
            buildPlot(data, isDark),
        []
    )
    return (
        <Common<StreamPerDayOfWeekQueryResult>
            query={streamPerDayOfWeekQueryByYear(year)}
            buildPlot={plotBuilder}
        />
    )
}
