import { type TopTracksQueryResult, queryTopTracksByYear } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'
import { useCallback } from 'react'

interface TopTracksProps {
    year: number | undefined
}

export function TopTracks({ year }: TopTracksProps) {
    const plotBuilder = useCallback(
        (data: TopTracksQueryResult[], isDark: boolean | undefined) =>
            buildPlot(data, isDark),
        []
    )
    const { sql, params } = queryTopTracksByYear(year)
    return (
        <Common<TopTracksQueryResult>
            query={sql}
            params={params}
            buildPlot={plotBuilder}
        />
    )
}
