import type { FC } from 'react'
import type { ConcentrationResult } from './query'
import { ChartCard, LabeledProgressBar } from '../shared'

type Props = {
    data: ConcentrationResult
}

export const ConcentrationScore: FC<Props> = ({ data }) => {
    const { top5_pct, top10_pct, top20_pct } = data

    return (
        <ChartCard title="Focus Mode" emoji="🔥">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Share of listening time for your top artists
            </div>
            <ul className="space-y-3" role="list">
                <li role="listitem">
                    <LabeledProgressBar
                        label="Top 5"
                        value={`${top5_pct.toFixed(1)}%`}
                        valueColor="text-brand-blue"
                        pct={top5_pct}
                        barColor="bg-brand-blue"
                    />
                </li>
                <li role="listitem">
                    <LabeledProgressBar
                        label="Top 10"
                        value={`${top10_pct.toFixed(1)}%`}
                        valueColor="text-brand-blue"
                        pct={top10_pct}
                        barColor="bg-brand-blue"
                    />
                </li>
                <li role="listitem">
                    <LabeledProgressBar
                        label="Top 20"
                        value={`${top20_pct.toFixed(1)}%`}
                        valueColor="text-brand-blue"
                        pct={top20_pct}
                        barColor="bg-brand-blue"
                    />
                </li>
            </ul>
        </ChartCard>
    )
}
