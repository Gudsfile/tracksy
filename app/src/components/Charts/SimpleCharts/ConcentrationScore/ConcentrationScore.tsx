import type { FC } from 'react'
import type { ConcentrationResult } from './query'
import { ChartCard } from '../../../ChartCard/ChartCard'

type Props = {
    data: ConcentrationResult
}

export const ConcentrationScore: FC<Props> = ({ data }) => {
    const { top5_pct, top10_pct, top20_pct } = data

    const bar = (pct: number) => (
        <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-3 mb-1 overflow-hidden">
            <div
                className="bg-brand-blue h-3 rounded"
                style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
            ></div>
        </div>
    )

    return (
        <ChartCard title="Focus Mode" emoji="🔥">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Share of listening time for your top artists
            </div>
            <ul className="space-y-3" role="list">
                <li role="listitem">
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span>Top 5</span>
                        <span className="text-brand-blue">
                            {top5_pct.toFixed(1)}%
                        </span>
                    </div>
                    {bar(top5_pct)}
                </li>
                <li role="listitem">
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span>Top 10</span>
                        <span className="text-brand-blue">
                            {top10_pct.toFixed(1)}%
                        </span>
                    </div>
                    {bar(top10_pct)}
                </li>
                <li role="listitem">
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span>Top 20</span>
                        <span className="text-brand-blue">
                            {top20_pct.toFixed(1)}%
                        </span>
                    </div>
                    {bar(top20_pct)}
                </li>
            </ul>
        </ChartCard>
    )
}
