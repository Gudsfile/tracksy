import { formatDuration } from '../../../../utils/formatDuration'
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
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-3xl md:text-4xl flex-shrink-0 animate-bounce-slow">
                🏆
            </div>

            <div className="flex-1 text-center md:text-left">
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
                    Top artist
                </div>

                <div className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white break-words text-balance">
                    {topArtist.artist_name}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                    most played artist
                </span>

                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                    With {topArtist.count_streams} streams, i.e.{' '}
                    {playedDuration}
                </div>
            </div>
        </div>
    )
})
