import type { FC } from 'react'
import type { SeasonalResult } from './query'
type Props = {
    data: SeasonalResult
}

export const SeasonalPatterns: FC<Props> = ({ data }) => {
    const { winter, spring, summer, fall, total } = data
    const percent = (count: number) => (total ? (count / total) * 100 : 0)

    const seasons = [
        { name: 'Winter ❄️', value: winter, color: 'bg-blue-400' },
        { name: 'Spring 🌸', value: spring, color: 'bg-green-400' },
        { name: 'Summer ☀️', value: summer, color: 'bg-yellow-400' },
        { name: 'Fall 🍂', value: fall, color: 'bg-orange-400' },
    ]

    const favorite = seasons.reduce((prev, current) =>
        prev.value > current.value ? prev : current
    )

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
                🌺 Seasonal patterns
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your favorite season:{' '}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                    {favorite.name.split(' ')[0]}
                </span>
            </div>

            <div className="space-y-3">
                {seasons.map((season) => (
                    <div key={season.name}>
                        <div className="flex justify-between text-xs mb-1">
                            <span>{season.name}</span>
                            <span>{percent(season.value).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className={`${season.color} h-2 rounded-full`}
                                style={{ width: `${percent(season.value)}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
