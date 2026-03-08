import type { FC } from 'react'
import type { SeasonalResult } from './query'
import { ChartCard } from '../../../ChartCard/ChartCard'

type Props = {
    data: SeasonalResult
}

export const SeasonalPatterns: FC<Props> = ({ data }) => {
    const { winter, spring, summer, fall, total } = data
    const percent = (count: number) => (total ? (count / total) * 100 : 0)

    const seasons = [
        { name: 'Winter', value: winter, color: 'bg-blue-400', emoji: '❄️' },
        { name: 'Spring', value: spring, color: 'bg-green-400', emoji: '🌸' },
        { name: 'Summer', value: summer, color: 'bg-yellow-400', emoji: '☀️' },
        { name: 'Fall', value: fall, color: 'bg-orange-400', emoji: '🍂' },
    ]

    const favorite = seasons.reduce((prev, current) =>
        prev.value > current.value ? prev : current
    )

    return (
        <ChartCard title="Seasonal Mood" emoji="🌺">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-2xl font-bold">{favorite.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {favorite.value?.toLocaleString()} streams
                    </div>
                </div>
                <div className="text-4xl">{favorite.emoji}</div>
            </div>

            <ul className="space-y-3" role="list">
                {seasons.map((season) => (
                    <li key={season.name} role="listitem">
                        <div className="flex justify-between text-xs mb-1">
                            <span>{season.name}</span>
                            <span>{percent(season.value).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-2">
                            <div
                                className={`${season.color} h-2 rounded-full`}
                                style={{ width: `${percent(season.value)}%` }}
                            ></div>
                        </div>
                    </li>
                ))}
            </ul>
        </ChartCard>
    )
}
