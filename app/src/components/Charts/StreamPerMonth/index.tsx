import { type QueryResult, queryByYear } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'
import { useCallback } from 'react'

interface StreamPerMonthProps {
    year: number
    maxValue: number
}

export function StreamPerMonth({ year, maxValue }: StreamPerMonthProps) {
    const plotBuilder = useCallback(
        (data: QueryResult[], isDark: boolean | undefined) =>
            buildPlot(data, maxValue, isDark),
        [maxValue]
    )
    return (
        <Common<QueryResult>
            query={queryByYear(year)}
            buildPlot={plotBuilder}
        />
    )
}
