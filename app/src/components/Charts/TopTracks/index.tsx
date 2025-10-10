import { type QueryResult, queryByYear } from './query'
import { buildPlot } from './plot'
import { Common } from '../Common'
import { useCallback } from 'react'

interface TopTracksProps {
    year: number
}

export function TopTracks({ year }: TopTracksProps) {
    const plotBuilder = useCallback(
        (data: QueryResult[], isDark: boolean | undefined) =>
            buildPlot(data, isDark),
        []
    )
    return (
        <Common<QueryResult>
            query={queryByYear(year)}
            buildPlot={plotBuilder}
        />
    )
}
