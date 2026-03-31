import { type TopAlbumsQueryResult, queryTopAlbumsByYear } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'

interface TopAlbumsProps {
    year: number | undefined
}

export function TopAlbums({ year }: TopAlbumsProps) {
    return (
        <Common<TopAlbumsQueryResult>
            query={queryTopAlbumsByYear(year)}
            buildPlot={buildPlot}
        />
    )
}
