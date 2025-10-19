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
        <div className="text-center flex flex-col items-center justify-between h-full overflow-hidden py-2">
            <div className="flex-1 flex flex-col justify-center items-center min-h-0 w-full">
                <div className="text-5xl md:text-6xl font-bold break-words leading-tight text-balance px-2">
                    {playedDuration}
                </div>
                <div className="text-5xl md:text-6xl mt-2 flex-shrink-0">
                    ⏳
                </div>
            </div>
            <div className="mt-2 flex-shrink-0">
                <div className="text-2xl font-medium">played duration</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    For {countStreams} streams
                </div>
            </div>
        </div>
    )
})
