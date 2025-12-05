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
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
                ⏭️ Listening Patience
            </h3>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-2xl font-bold">
                        {complete_pct.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">Full listens</div>
                </div>
                <div className="text-4xl">{emoji}</div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-2">
                <div
                    className="bg-green-500 h-full transition-all duration-500"
                    style={{ width: `${complete_pct}%` }}
                ></div>
            </div>

            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span>Skippped ({skipped_listens.toLocaleString()})</span>
                <span>Completed ({complete_listens.toLocaleString()})</span>
            </div>

            <div className="text-sm text-center font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                {classification} : {message}
            </div>
        </div>
    )
}
