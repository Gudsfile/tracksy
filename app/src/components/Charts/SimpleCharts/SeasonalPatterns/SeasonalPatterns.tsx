import type { FC } from 'react'
import type { SeasonalResult } from './query'
import { ChartCard } from '../shared/ChartCard'
import { ChartHero, LabeledProgressBar } from '../shared'

type Props = {
    data: SeasonalResult | undefined
    isLoading?: boolean
}

export const SeasonalPatterns: FC<Props> = ({ data, isLoading }) => {
    const {
        winter = 0,
        spring = 0,
        summer = 0,
        fall = 0,
        total = 0,
    } = data ?? {}
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
        <ChartCard title="Seasonal Mood" emoji="🌺" isLoading={isLoading}>
            <ChartHero
                label={favorite.name}
                sublabel={`${favorite.value?.toLocaleString()} streams`}
                emoji={favorite.emoji}
            />
            <ul className="space-y-3" role="list">
                {seasons.map((season) => (
                    <li key={season.name} role="listitem">
                        <LabeledProgressBar
                            label={season.name}
                            value={`${percent(season.value).toFixed(1)}%`}
                            valueColor="text-gray-600 dark:text-gray-400"
                            pct={percent(season.value)}
                            barColor={season.color}
                        />
                    </li>
                ))}
            </ul>
        </ChartCard>
    )
}
