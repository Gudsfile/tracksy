import { type QueryResult, queryByYear } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'

interface StreamPerHourProps {
    year: number
    maxValue: number
}

export function StreamPerHour({ year, maxValue }: StreamPerHourProps) {
    return (
        <Common<QueryResult>
            query={queryByYear(year)}
            buildPlot={(data, isDark) => buildPlot(data, maxValue, isDark)}
        />
    )
}
