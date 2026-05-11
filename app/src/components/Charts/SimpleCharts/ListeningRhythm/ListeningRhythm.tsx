import type { FC } from 'react'
import type { ListeningRhythmResult } from './query'
import {
    ChartCard,
    ChartCardEmpty,
    ChartHero,
    LabeledProgressBar,
} from '../shared'

type Props = {
    data: ListeningRhythmResult | undefined
    isLoading?: boolean
}

export const ListeningRhythm: FC<Props> = ({ data, isLoading }) => {
    const periods = data
        ? [
              {
                  label: 'Morning',
                  value: data.morning,
                  emoji: '🥣',
                  time: '6‑11h',
              },
              {
                  label: 'Afternoon',
                  value: data.afternoon,
                  emoji: '🧃',
                  time: '12‑17h',
              },
              {
                  label: 'Evening',
                  value: data.evening,
                  emoji: '🫒',
                  time: '18‑21h',
              },
              { label: 'Night', value: data.night, emoji: '🫐', time: '22‑5h' },
          ]
        : []
    const total = data?.total ?? 0
    const percent = (count: number) => (total ? (count / total) * 100 : 0)
    const favorite = periods.length
        ? periods.reduce((prev, current) =>
              prev.value > current.value ? prev : current
          )
        : null

    return (
        <ChartCard
            title="Daily Vibes"
            emoji="⏰"
            isLoading={isLoading}
            question="What time of day do I listen the most?"
        >
            {!data?.total ? (
                <ChartCardEmpty />
            ) : (
                <>
                    {favorite && (
                        <ChartHero
                            label={favorite.label}
                            sublabel={`${favorite.value?.toLocaleString()} streams`}
                            emoji={favorite.emoji}
                        />
                    )}
                    <ul className="space-y-3" role="list">
                        {periods.map((period) => (
                            <li key={period.label} role="listitem">
                                <LabeledProgressBar
                                    label={`${period.label} (${period.time})`}
                                    value={`${percent(period.value).toFixed(1)}%`}
                                    pct={percent(period.value)}
                                    barColor="bg-brand-purple"
                                />
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </ChartCard>
    )
}
