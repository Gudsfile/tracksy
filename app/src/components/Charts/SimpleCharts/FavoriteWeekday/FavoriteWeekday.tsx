import type { FC } from 'react'
import type { FavoriteWeekdayResult } from './query'

type Props = {
    data: FavoriteWeekdayResult[]
}

const DAY_ABBREVIATIONS: Record<string, string> = {
    Monday: 'Mon',
    Tuesday: 'Tue',
    Wednesday: 'Wed',
    Thursday: 'Thu',
    Friday: 'Fri',
    Saturday: 'Sat',
    Sunday: 'Sun',
}

export const FavoriteWeekday: FC<Props> = ({ data }) => {
    if (!data || data.length === 0) return null

    const favoriteDay = data.reduce(
        (max, day) => (day.pct > max.pct ? day : max),
        data[0]
    )
    const maxPct = Math.max(...data.map((d) => d.pct))

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
                📅 Favorite Weekday
            </h3>

            <div className="text-2xl font-bold text-orange-400 mb-1">
                {favoriteDay.day_name}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {favoriteDay.stream_count.toLocaleString()} streams
            </div>

            <div className="grid grid-cols-7 gap-1">
                {data.map((day) => {
                    const isFavorite = day.day_name === favoriteDay.day_name
                    const heightPct = (day.pct / maxPct) * 100

                    return (
                        <div
                            key={day.day_name}
                            className="flex flex-col items-center gap-1"
                        >
                            <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                {DAY_ABBREVIATIONS[day.day_name]}
                            </div>
                            <div className="w-full h-16 bg-gray-100 dark:bg-gray-800 rounded-sm flex items-end overflow-hidden">
                                <div
                                    className={`w-full rounded-sm transition-all duration-300 ${
                                        isFavorite
                                            ? 'bg-orange-400'
                                            : 'bg-yellow-400'
                                    }`}
                                    style={{ height: `${heightPct}%` }}
                                ></div>
                            </div>
                            <div className="text-[9px] text-gray-500 dark:text-gray-400">
                                {day.pct.toFixed(0)}%
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
