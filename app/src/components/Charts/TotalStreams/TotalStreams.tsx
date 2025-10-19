import type { QueryResult } from './query'
import { memo } from 'react'
import { formatDuration } from '../../../utils/formatDuration'

interface TotalStreamsProps {
    data: QueryResult[]
}

export const TotalStreams = memo(function TotalStreams({
    data,
}: TotalStreamsProps) {
    if (data.length === 0) return null

    const playedDuration = formatDuration(data[0].ms_played).split(' ')[0]
    const countStreams = data[0].count_streams

    return (
        <div className="text-center">
            <div className="text-8xl font-bold">{playedDuration} ⏳</div>
            <div className="text-2xl">played duration</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
                For {countStreams} streams
            </div>
        </div>
    )
})
