import { formatDuration } from '../../../utils/formatDuration'
import type { TopArtistQueryResult } from './query'
import { memo } from 'react'

interface TopArtistProps {
    data: TopArtistQueryResult[]
}

export const TopArtist = memo(function TopArtist({ data }: TopArtistProps) {
    if (data.length === 0) return null

    const topArtist = data[0]
    const playedDuration = formatDuration(topArtist.ms_played).split(' ')[0]

    return (
        <div className="text-center flex flex-col items-center justify-between h-full py-2">
            <div className="flex-1 flex flex-col justify-center items-center min-h-0 w-full">
                <div className="text-3xl md:text-5xl font-bold break-words leading-tight text-balance px-2">
                    {topArtist.artist_name}
                </div>
                <div className="text-5xl md:text-6xl mt-2 flex-shrink-0">
                    🏆
                </div>
            </div>
            <div className="mt-2 flex-shrink-0">
                <div className="text-2xl font-medium">most played artist</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    With {topArtist.count_streams} streams, i.e.{' '}
                    {playedDuration}
                </div>
            </div>
        </div>
    )
})
