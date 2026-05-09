import type { FC } from 'react'
import type { RepeatResult } from './query'
import { classifyRepeatBehavior } from './classifyRepeatBehavior'
import { ChartCard, ChartHero } from '../shared'

type Props = {
    data: RepeatResult | undefined
    isLoading?: boolean
}

export const RepeatBehavior: FC<Props> = ({ data, isLoading }) => {
    const {
        total_repeat_sequences = 0,
        max_consecutive = 0,
        most_repeated_track = '',
        avg_repeat_length = 0,
    } = data ?? {}

    const { classification, emoji } = classifyRepeatBehavior(
        total_repeat_sequences
    )

    if (!isLoading && total_repeat_sequences === 0) return null

    return (
        <ChartCard title="Replay Energy" emoji="🔁" isLoading={isLoading}>
            {data && (
                <>
                    <ChartHero
                        label={classification}
                        sublabel={`${total_repeat_sequences} repeated sequences`}
                        emoji={emoji}
                    />

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
                                    Repeat average
                                </span>
                                <span className="font-bold">
                                    {avg_repeat_length.toFixed(1)} times
                                </span>
                            </li>
                        </ul>
                    </div>
                </>
            )}
        </ChartCard>
    )
}
