import { type QueryResult, queryByYear } from './query'
import { buildPlotWrapper } from './plot'
import { Common } from '../Common'

interface StreamPerHourProps {
    year: number
    maxValue: number
}

export function StreamPerHour({ year, maxValue }: StreamPerHourProps) {
    return (
        <Common<QueryResult>
            query={queryByYear(year)}
            buildPlot={buildPlotWrapper(maxValue)}
        />
    )
}
