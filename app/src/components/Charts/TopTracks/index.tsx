import { type TopTracksQueryResult, queryTopTracksByYear } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'
import { useCallback } from 'react'

interface TopTracksProps {
    year: number
}

export function TopTracks({ year }: TopTracksProps) {
    const plotBuilder = useCallback(
        (data: TopTracksQueryResult[], isDark: boolean | undefined) =>
            buildPlot(data, isDark),
        []
    )
    return (
        <Common<TopTracksQueryResult>
            query={queryTopTracksByYear(year)}
            buildPlot={plotBuilder}
        />
    )
}
