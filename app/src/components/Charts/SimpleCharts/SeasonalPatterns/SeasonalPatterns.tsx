import type { FC } from 'react'
import type { SeasonalResult } from './query'
import { ChartCard } from '../shared/ChartCard'
import { ChartCardEmpty, ChartHero, LabeledProgressBar } from '../shared'

type Props = {
    data: SeasonalResult | undefined
    isLoading?: boolean
}

export const SeasonalPatterns: FC<Props> = ({ data, isLoading }) => {
    const total = data?.total ?? 0
    const percent = (count: number) => (total ? (count / total) * 100 : 0)

    const seasons = [
        {
            name: 'Winter',
            value: data?.winter ?? 0,
            color: 'bg-blue-400',
            emoji: '❄️',
        },
        {
            name: 'Spring',
            value: data?.spring ?? 0,
            color: 'bg-green-400',
            emoji: '🌸',
        },
        {
            name: 'Summer',
            value: data?.summer ?? 0,
            color: 'bg-yellow-400',
            emoji: '☀️',
        },
        {
            name: 'Fall',
            value: data?.fall ?? 0,
            color: 'bg-orange-400',
            emoji: '🍂',
        },
    ]

    const favorite = seasons.reduce((prev, current) =>
        prev.value > current.value ? prev : current
    )

    return (
        <ChartCard
            title="Seasonal Mood"
            emoji="🌺"
            isLoading={isLoading}
            question="Which season do I listen the most?"
        >
            {!data?.total ? (
                <ChartCardEmpty />
            ) : (
                <>
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
                </>
            )}
        </ChartCard>
    )
}
