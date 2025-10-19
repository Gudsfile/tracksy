import type { TopStreakQueryResult } from './query'
import { memo } from 'react'

interface TopStreakProps {
    data: TopStreakQueryResult[]
}

export const TopStreak = memo(function TopStreak({ data }: TopStreakProps) {
    if (data.length === 0) return null

    const streak = data[0]
    const from = new Date(streak.start_ts).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
    const to = new Date(streak.end_ts).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div className="text-center flex flex-col items-center justify-between h-full overflow-hidden py-2">
            <div className="flex-1 flex flex-col justify-center items-center min-h-0 w-full">
                <div className="text-5xl md:text-6xl font-bold break-words leading-tight text-balance px-2">
                    {streak.streaks}
                </div>
                <div className="text-5xl md:text-6xl mt-2 flex-shrink-0">
                    🔥
                </div>
            </div>
            <div className="mt-2 flex-shrink-0">
                <div className="text-2xl font-medium">days in a row</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    From {from} to {to}
                </div>
            </div>
        </div>
    )
})
