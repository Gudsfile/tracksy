import { type QueryResult, queryByYear } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'

interface TopArtistsProps {
    year: number
}

export function TopArtists({ year }: TopArtistsProps) {
    return (
        <Common<QueryResult> query={queryByYear(year)} buildPlot={buildPlot} />
    )
}
