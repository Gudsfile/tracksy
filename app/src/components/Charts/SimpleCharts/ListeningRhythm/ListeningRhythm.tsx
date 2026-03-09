import type { FC } from 'react'
import type { ListeningRhythmResult } from './query'
import { ChartCard, ChartHero, LabeledProgressBar } from '../shared'

type Props = {
    data: ListeningRhythmResult
}

export const ListeningRhythm: FC<Props> = ({ data }) => {
    const { morning, afternoon, evening, night, total } = data
    const percent = (count: number) => (total ? (count / total) * 100 : 0)

    const periods = [
        { label: 'Morning', value: morning, emoji: '🥣', time: '6‑11h' },
        { label: 'Afternoon', value: afternoon, emoji: '🧃', time: '12‑17h' },
        { label: 'Evening', value: evening, emoji: '🫒', time: '18‑21h' },
        { label: 'Night', value: night, emoji: '🫐', time: '22‑5h' },
    ]

    const favorite = periods.reduce((prev, current) =>
        prev.value > current.value ? prev : current
    )

    return (
        <ChartCard title="Daily Vibes" emoji="⏰">
            <ChartHero
                label={favorite.label}
                sublabel={`${favorite.value?.toLocaleString()} streams`}
                emoji={favorite.emoji}
            />
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
        </ChartCard>
    )
}
