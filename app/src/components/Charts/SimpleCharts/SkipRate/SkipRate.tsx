import type { FC } from 'react'
import type { SkipRateResult } from './query'
import { classifySkipRate } from './classifySkipRate'

type Props = {
    data: SkipRateResult
}

export const SkipRate: FC<Props> = ({ data }) => {
    const { complete_listens, skipped_listens } = data

    const complete_pct =
        (complete_listens / (complete_listens + skipped_listens)) * 100
    const { classification, emoji, message } = classifySkipRate(complete_pct)

    return (
        <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                ⏭️ Listening Patience
            </h3>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-2xl font-bold">
                        {complete_pct.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Full listens
                    </div>
                </div>
                <div className="text-4xl">{emoji}</div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-3 overflow-hidden mb-2">
                <div
                    className="bg-green-500 h-full transition-all duration-300"
                    style={{ width: `${complete_pct}%` }}
                ></div>
            </div>

            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-3">
                <span>Skippped ({skipped_listens.toLocaleString()})</span>
                <span>Completed ({complete_listens.toLocaleString()})</span>
            </div>

            <div className="text-sm text-center font-medium text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-slate-700/50 p-2 rounded-lg">
                {classification} : {message}
            </div>
        </div>
    )
}
