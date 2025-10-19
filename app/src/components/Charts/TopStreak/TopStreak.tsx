import type { QueryResult } from './query'
import { memo } from 'react'

interface TopStreakProps {
    data: QueryResult[]
}

export const TopStreak = memo(function TopStreak({ data }: TopStreakProps) {
    console.log(data)
    if (!data || data.length === 0) return <></>

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
        <div className="text-center">
            <div className="text-8xl font-bold">{streak.streaks} 🔥</div>
            <div className="text-2xl">days in a row</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
                From {from} to {to}
            </div>
        </div>
    )
})
