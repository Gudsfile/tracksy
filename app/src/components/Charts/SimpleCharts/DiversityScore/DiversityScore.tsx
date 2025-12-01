import type { FC } from 'react'
import type { DiversityResult } from './query'
type Props = {
    data: DiversityResult
}

export const DiversityScore: FC<Props> = ({ data }) => {
    const { unique_artists, total_streams, avg_streams_per_artist } = data

    const getClassification = (avg: number) => {
        if (avg >= 50)
            return {
                label: 'Loyal',
                color: 'text-purple-600 dark:text-purple-400',
                barColor: 'bg-purple-500',
            }
        if (avg >= 25)
            return {
                label: 'Balanced',
                color: 'text-blue-600 dark:text-blue-400',
                barColor: 'bg-blue-500',
            }
        return {
            label: 'Explorer',
            color: 'text-green-600 dark:text-green-400',
            barColor: 'bg-green-500',
        }
    }

    const classification = getClassification(avg_streams_per_artist)

    const barWidth = Math.min((avg_streams_per_artist / 100) * 100, 100)

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
                🎨 Loyalty vs Discovery
            </h3>
            <div className={`text-2xl font-bold mb-1 ${classification.color}`}>
                {classification.label}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {avg_streams_per_artist.toFixed(1)} streams/artist (average)
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div
                    className={`${classification.barColor} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${barWidth}%` }}
                ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
                {unique_artists.toLocaleString()} artists •{' '}
                {total_streams.toLocaleString()} streams
            </p>
        </div>
    )
}
