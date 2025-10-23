import { formatDuration } from '../../../utils/formatDuration'
import type { QueryResult } from './query'
import { memo } from 'react'

interface TopArtistProps {
    data: QueryResult[]
}

export const TopArtist = memo(function TopArtist({ data }: TopArtistProps) {
    if (data.length === 0) return null

    const topArtist = data[0]
    const playedDuration = formatDuration(topArtist.ms_played).split(' ')[0]

    return (
        <div className="text-center">
            <div className="text-8xl font-bold">{topArtist.artist_name} 🏆</div>
            <div className="text-2xl">most played artist</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
                For {topArtist.count_streams} streams in {playedDuration}
            </div>
        </div>
    )
})
