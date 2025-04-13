import { type QueryResult, query } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'

export function StreamPerHour() {
    return <Common<QueryResult> query={query} buildPlot={buildPlot} />
}
