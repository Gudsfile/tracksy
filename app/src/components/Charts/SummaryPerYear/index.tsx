import { type QueryResult, queryByYear } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'

interface SummaryPerYearProps {
    year: number
}

export function SummaryPerYear({ year }: SummaryPerYearProps) {
    return (
        <Common<QueryResult> query={queryByYear(year)} buildPlot={buildPlot} />
    )
}
