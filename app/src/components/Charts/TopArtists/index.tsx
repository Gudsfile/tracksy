import { type TopArtistsQueryResult, queryTopArtistsByYear } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'

interface TopArtistsProps {
    year: number
}

export function TopArtists({ year }: TopArtistsProps) {
    return (
        <Common<TopArtistsQueryResult>
            query={queryTopArtistsByYear(year)}
            buildPlot={buildPlot}
        />
    )
}
