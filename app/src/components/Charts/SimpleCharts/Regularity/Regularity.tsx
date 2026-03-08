import type { FC } from 'react'
import type { RegularityResult } from './query'
import { classifyRegularity } from './classifyRegularity'
import { ChartCard } from '../../../ChartCard/ChartCard'

type Props = {
    data: RegularityResult
}

export const Regularity: FC<Props> = ({ data }) => {
    const { days_with_streams, total_days, longest_pause_days } = data

    const regularity_pct = (days_with_streams / total_days) * 100
    const { label, color, strokeColor, emoji } =
        classifyRegularity(regularity_pct)

    const size = 120
    const strokeWidth = 10
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (regularity_pct / 100) * circumference

    return (
        <ChartCard
            title="Consistency Meter"
            emoji="⏳"
            className="flex flex-col h-full relative"
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-2xl font-bold">{label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {days_with_streams} / {total_days} days
                    </div>
                </div>
                <div className="text-4xl">{emoji}</div>
            </div>

            <div className="flex-1 flex items-center justify-center mb-4">
                <div className="relative">
                    <svg
                        width={size}
                        height={size}
                        className="transform -rotate-90"
                    >
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className={`${strokeColor} transition-all duration-500`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-2xl mb-1">{emoji}</div>
                        <div className={`text-xl font-bold ${color}`}>
                            {regularity_pct.toFixed(0)}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
                Longest pause:{' '}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                    {longest_pause_days}d
                </span>
            </div>
        </ChartCard>
    )
}
