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
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-3xl md:text-4xl flex-shrink-0 animate-bounce-slow">
                🔥
            </div>

            <div className="flex-1 text-center md:text-left">
                <div className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
                    Top streak
                </div>

                <div className="text-3xl md:text-6xl font-bold text-gray-900 dark:text-white break-words text-balance">
                    {streak.streaks}
                </div>

                <span className="text-sm text-gray-600 dark:text-gray-300">
                    days in a row
                </span>

                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                    From {from} to {to}
                </div>
            </div>
        </div>
    )
})
