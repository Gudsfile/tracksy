import type { FC } from 'react'
import type { ConcentrationResult } from './query'
import { ChartCard, LabeledProgressBar } from '../shared'

type Props = {
    data: ConcentrationResult
}

export const ConcentrationScore: FC<Props> = ({ data }) => {
    const { top5_pct, top10_pct, top20_pct } = data

    const scores = [
        { label: 'Top 5', value: top5_pct },
        { label: 'Top 10', value: top10_pct },
        { label: 'Top 20', value: top20_pct },
    ]

    return (
        <ChartCard title="Focus Mode" emoji="🔥">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Share of listening time for your top artists
            </div>
            <ul className="space-y-3" role="list">
                {scores.map((score) => (
                    <li key={score.label} role="listitem">
                        <LabeledProgressBar
                            label={score.label}
                            value={`${score.value.toFixed(1)}%`}
                            valueColor="text-brand-blue"
                            pct={score.value}
                            barColor="bg-brand-blue"
                        />
                    </li>
                ))}
            </ul>
        </ChartCard>
    )
}
