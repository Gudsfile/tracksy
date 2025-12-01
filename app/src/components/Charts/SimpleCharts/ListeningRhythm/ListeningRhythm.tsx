import type { FC } from 'react'
import type { ListeningRhythmResult } from './query'

type Props = {
    data: ListeningRhythmResult
}

export const ListeningRhythm: FC<Props> = ({ data }) => {
    const { morning, afternoon, evening, night, total } = data
    const percent = (count: number) => (total ? (count / total) * 100 : 0)

    const bar = (pct: number) => (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2 mb-1">
            <div
                className="bg-purple-500 h-2 rounded"
                style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
            ></div>
        </div>
    )

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
                ⏰ Listening Rhythm
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Share of listening time per time of day
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-xs">
                    <span>Morning (6‑11h)</span>
                    <span>{percent(morning).toFixed(1)}%</span>
                </div>
                {bar(percent(morning))}
                <div className="flex justify-between text-xs">
                    <span>Afternoon (12‑17h)</span>
                    <span>{percent(afternoon).toFixed(1)}%</span>
                </div>
                {bar(percent(afternoon))}
                <div className="flex justify-between text-xs">
                    <span>Evening (18‑21h)</span>
                    <span>{percent(evening).toFixed(1)}%</span>
                </div>
                {bar(percent(evening))}
                <div className="flex justify-between text-xs">
                    <span>Night (22‑5h)</span>
                    <span>{percent(night).toFixed(1)}%</span>
                </div>
                {bar(percent(night))}
            </div>
        </div>
    )
}
