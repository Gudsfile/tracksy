import type { TotalStreamsQueryResult } from './query'
import { memo } from 'react'
import { formatDuration } from '../../../utils/formatDuration'

interface TotalStreamsProps {
    data: TotalStreamsQueryResult[]
}

export const TotalStreams = memo(function TotalStreams({
    data,
}: TotalStreamsProps) {
    if (data.length === 0) return null

    const playedDuration = formatDuration(data[0].ms_played).split(' ')[0]
    const countStreams = data[0].count_streams

    return (
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-3xl md:text-4xl flex-shrink-0 animate-bounce-slow">
                ⏳
            </div>

            <div className="flex-1 text-center md:text-left">
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
                    Total streams
                </div>

                <div className="text-3xl md:text-6xl font-bold text-gray-900 dark:text-white break-words text-balance">
                    {playedDuration}
                </div>

                <span className="text-sm text-gray-600 dark:text-gray-300">
                    played duration
                </span>

                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                    For {countStreams} streams
                </div>
            </div>
        </div>
    )
})
