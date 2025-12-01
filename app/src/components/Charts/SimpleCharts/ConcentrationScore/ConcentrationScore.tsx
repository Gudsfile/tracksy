import type { FC } from 'react'
import type { ConcentrationResult } from './query'

type Props = {
    data: ConcentrationResult
}

export const ConcentrationScore: FC<Props> = ({ data }) => {
    const { top5_pct, top10_pct, top20_pct } = data

    const bar = (pct: number) => (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2 mb-1">
            <div
                className="bg-blue-500 h-2 rounded"
                style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
            ></div>
        </div>
    )

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
                📊 Concentration Score
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Share of listening time for your top artists
            </div>
            <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                    <span>Top 5</span>
                    <span>{top5_pct.toFixed(1)}%</span>
                </div>
                {bar(top5_pct)}
                <div className="flex justify-between text-xs mb-1 mt-2">
                    <span>Top 10</span>
                    <span>{top10_pct.toFixed(1)}%</span>
                </div>
                {bar(top10_pct)}
                <div className="flex justify-between text-xs mb-1 mt-2">
                    <span>Top 20</span>
                    <span>{top20_pct.toFixed(1)}%</span>
                </div>
                {bar(top20_pct)}
            </div>
        </div>
    )
}
