import type { FC } from 'react'
import type { RegularityResult } from './query'
import { classifyRegularity } from './classifyRegularity'

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
        <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in flex flex-col h-full relative">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                📅 Listening Regularity
            </h3>

            <div className={`text-2xl font-bold ${color}`}>{label}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span className="font-bold text-gray-900 dark:text-gray-100 text-base">
                    {days_with_streams}
                </span>{' '}
                / {total_days} days
            </div>

            <div className="flex-1 flex items-center justify-center mb-4">
                <div className="relative">
                    <svg
                        width={size}
                        height={size}
                        className="transform -rotate-90"
                    >
                        {/* Background circle */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            className="text-gray-200 dark:text-gray-700"
                        />
                        {/* Progress circle */}
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
                    {/* Center content */}
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
        </div>
    )
}
