import type { FC } from 'react'
import type { ListeningRhythmResult } from './query'
import { ChartCard, ChartHero, LabeledProgressBar } from '../shared'

type Props = {
    data: ListeningRhythmResult
}

export const ListeningRhythm: FC<Props> = ({ data }) => {
    const { morning, afternoon, evening, night, total } = data
    const percent = (count: number) => (total ? (count / total) * 100 : 0)

    const dominant = Math.max(morning, afternoon, evening, night)
    const emoji =
        morning == dominant
            ? '🥣'
            : afternoon == dominant
              ? '🧃'
              : evening == dominant
                ? '🫒'
                : '🫐'

    const label =
        morning == dominant
            ? 'Morning'
            : afternoon == dominant
              ? 'Afternoon'
              : evening == dominant
                ? 'Evening'
                : 'Night'

    return (
        <ChartCard title="Daily Vibes" emoji="⏰">
            <ChartHero
                label={label}
                sublabel={`${dominant.toLocaleString()} streams`}
                emoji={emoji}
            />
            <ul className="space-y-2" role="list">
                <li role="listitem">
                    <LabeledProgressBar
                        label="Morning (6‑11h)"
                        value={`${percent(morning).toFixed(1)}%`}
                        pct={percent(morning)}
                        barColor="bg-brand-purple"
                    />
                </li>
                <li role="listitem">
                    <LabeledProgressBar
                        label="Afternoon (12‑17h)"
                        value={`${percent(afternoon).toFixed(1)}%`}
                        pct={percent(afternoon)}
                        barColor="bg-brand-purple"
                    />
                </li>
                <li role="listitem">
                    <LabeledProgressBar
                        label="Evening (18‑21h)"
                        value={`${percent(evening).toFixed(1)}%`}
                        pct={percent(evening)}
                        barColor="bg-brand-purple"
                    />
                </li>
                <li role="listitem">
                    <LabeledProgressBar
                        label="Night (22‑5h)"
                        value={`${percent(night).toFixed(1)}%`}
                        pct={percent(night)}
                        barColor="bg-brand-purple"
                    />
                </li>
            </ul>
        </ChartCard>
    )
}
