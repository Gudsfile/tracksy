import type { FC } from 'react'
import type { SkipRateResult } from './query'
import { classifySkipRate } from './classifySkipRate'
import { ChartCard } from '../../../ChartCard/ChartCard'

type Props = {
    data: SkipRateResult
}

export const SkipRate: FC<Props> = ({ data }) => {
    const { complete_listens, skipped_listens } = data

    const complete_pct =
        (complete_listens / (complete_listens + skipped_listens)) * 100
    const { classification, emoji, message } = classifySkipRate(complete_pct)

    return (
        <ChartCard title="Skip Mood" emoji="⏭️">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-2xl font-bold">{classification}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {complete_pct.toFixed(1)}% are full listens
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

            <ul
                className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-3"
                role="list"
            >
                <li role="listitem">
                    Skippped ({skipped_listens.toLocaleString()})
                </li>
                <li role="listitem">
                    Completed ({complete_listens.toLocaleString()})
                </li>
            </ul>

            <div className="text-sm text-center font-medium text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-slate-700/50 p-2 rounded-lg">
                {message}
            </div>
        </ChartCard>
    )
}
