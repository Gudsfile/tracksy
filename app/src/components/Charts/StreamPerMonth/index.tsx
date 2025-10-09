import { type QueryResult, queryByYear } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'

interface StreamPerMonthProps {
    year: number
}

export function StreamPerMonth({ year }: StreamPerMonthProps) {
    return (
        <Common<QueryResult> query={queryByYear(year)} buildPlot={buildPlot} />
    )
}
