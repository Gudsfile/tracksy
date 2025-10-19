import { type QueryResult, queryByYear } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'
import { useCallback } from 'react'

interface StreamPerMonthProps {
    year: number
}

export function StreamPerMonth({ year }: StreamPerMonthProps) {
    const plotBuilder = useCallback(buildPlot, [])
    return (
        <Common<QueryResult>
            query={queryByYear(year)}
            buildPlot={plotBuilder}
        />
    )
}
