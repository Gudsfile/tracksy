import { type TopArtistsQueryResult, queryTopArtistsByYear } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'

interface TopArtistsProps {
    year: number | undefined
}

export function TopArtists({ year }: TopArtistsProps) {
    const { sql, params } = queryTopArtistsByYear(year)
    return (
        <Common<TopArtistsQueryResult>
            query={sql}
            params={params}
            buildPlot={buildPlot}
        />
    )
}
