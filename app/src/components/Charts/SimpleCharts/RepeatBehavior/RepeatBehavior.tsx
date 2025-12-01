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

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
                🔁 Repeat Behavior
            </h3>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-2xl font-bold">{classification}</div>
                    <div className="text-xs text-gray-500">Your style</div>
                </div>
                <div className="text-4xl">{emoji}</div>
            </div>

            <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Repeat Record
                    </div>
                    <div className="font-medium text-purple-600 dark:text-purple-400 line-clamp-1">
                        "{most_repeated_track}"
                    </div>
                    <div className="text-sm font-bold mt-1">
                        {max_consecutive} times in a row 🎸
                    </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                        Repeated sequences
                    </span>
                    <span className="font-bold">{total_repeat_sequences}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                        Repeat average
                    </span>
                    <span className="font-bold">
                        {avg_repeat_length?.toFixed(1) || 0} times
                    </span>
                </div>
            </div>
        </div>
    )
}
