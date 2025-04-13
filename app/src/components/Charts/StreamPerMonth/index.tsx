import { type QueryResult, query } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'

export function StreamPerMonth() {
    return <Common<QueryResult> query={query} buildPlot={buildPlot} />
}
