import type { FC } from 'react'
import type { ConcentrationResult } from './query'

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

    if (top5_pct === null || top10_pct === null || top20_pct === null)
        return undefined

    return (
        <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                📊 Concentration Score
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Share of listening time for your top artists
            </div>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span>Top 5</span>
                        <span className="text-brand-blue">
                            {top5_pct.toFixed(1)}%
                        </span>
                    </div>
                    {bar(top5_pct)}
                </div>
                <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span>Top 10</span>
                        <span className="text-brand-blue">
                            {top10_pct.toFixed(1)}%
                        </span>
                    </div>
                    {bar(top10_pct)}
                </div>
                <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span>Top 20</span>
                        <span className="text-brand-blue">
                            {top20_pct.toFixed(1)}%
                        </span>
                    </div>
                    {bar(top20_pct)}
                </div>
            </div>
        </div>
    )
}
