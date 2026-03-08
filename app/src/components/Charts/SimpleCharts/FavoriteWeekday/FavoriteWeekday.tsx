import type { FC } from 'react'
import type { FavoriteWeekdayResult } from './query'
import { ChartCard } from '../../../ChartCard/ChartCard'

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
        <ChartCard title="Your Power Day" emoji="📅">
            <div className="mb-4">
                <div className="text-2xl font-bold text-orange-400">
                    {favoriteDay.day_name}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {favoriteDay.stream_count.toLocaleString()} streams
                </div>
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
                            <div className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                                {DAY_ABBREVIATIONS[day.day_name]}
                            </div>
                            <div className="w-full h-16 bg-gray-200 dark:bg-slate-700/50 rounded-sm flex items-end overflow-hidden">
                                <div
                                    className={`w-full rounded-sm transition-all duration-300 ${
                                        isFavorite
                                            ? 'bg-orange-400'
                                            : 'bg-yellow-400'
                                    }`}
                                    style={{ height: `${heightPct}%` }}
                                ></div>
                            </div>
                            <div className="text-[9px] text-gray-600 dark:text-gray-400">
                                {day.pct.toFixed(0)}%
                            </div>
                        </div>
                    )
                })}
            </div>
        </ChartCard>
    )
}
