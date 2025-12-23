import type { FC } from 'react'
import type { RepeatResult } from './query'
import { classifyRepeatBehavior } from './classifyRepeatBehavior'

type Props = {
    data: RepeatResult
}

export const RepeatBehavior: FC<Props> = ({ data }) => {
    const {
        total_repeat_sequences,
        max_consecutive,
        most_repeated_track,
        avg_repeat_length,
    } = data

    const { classification, emoji } = classifyRepeatBehavior(
        total_repeat_sequences
    )

    if (total_repeat_sequences === 0) return undefined

    return (
        <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                🔁 Repeat Behavior
            </h3>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-2xl font-bold">{classification}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        Your style
                    </div>
                </div>
                <div className="text-4xl">{emoji}</div>
            </div>

            <div className="space-y-3">
                <div className="bg-gray-200 dark:bg-slate-700/50 p-3 rounded-lg">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Repeat Record
                    </div>
                    <div className="font-medium text-brand-purple dark:text-brand-purple line-clamp-1">
                        "{most_repeated_track}"
                    </div>
                    <div className="text-sm font-bold mt-1">
                        {max_consecutive} times in a row 🎸
                    </div>
                </div>

                <ul className="mb-1" role="list">
                    <li
                        className="flex justify-between items-center text-sm"
                        role="listitem"
                    >
                        <span className="text-gray-600 dark:text-gray-400">
                            Repeated sequences
                        </span>
                        <span className="font-bold">
                            {total_repeat_sequences}
                        </span>
                    </li>

                    <li
                        className="flex justify-between items-center text-sm"
                        role="listitem"
                    >
                        <span className="text-gray-600 dark:text-gray-400">
                            Repeat average
                        </span>
                        <span className="font-bold">
                            {avg_repeat_length.toFixed(1)} times
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    )
}
