import {
    type StreamPerDayOfWeekQueryResult,
    streamPerDayOfWeekQueryByYear,
} from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'
import { useCallback } from 'react'

interface StreamPerDayOfWeekProps {
    year: number | undefined
}

export function StreamPerDayOfWeek({ year }: StreamPerDayOfWeekProps) {
    const plotBuilder = useCallback(
        (data: StreamPerDayOfWeekQueryResult[], isDark: boolean | undefined) =>
            buildPlot(data, isDark),
        []
    )
    const { sql, params } = streamPerDayOfWeekQueryByYear(year)
    return (
        <Common<StreamPerDayOfWeekQueryResult>
            query={sql}
            params={params}
            buildPlot={plotBuilder}
        />
    )
}
