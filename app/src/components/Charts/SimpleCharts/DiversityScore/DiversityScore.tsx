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
                emoji: '🔂',
            }
        if (avg >= 25)
            return {
                label: 'Balanced',
                color: 'text-blue-600 dark:text-blue-400',
                barColor: 'bg-blue-500',
                emoji: '⚖️',
            }
        return {
            label: 'Explorer',
            color: 'text-green-600 dark:text-green-400',
            barColor: 'bg-green-500',
            emoji: '🔍',
        }
    }

    const classification = getClassification(avg_streams_per_artist)

    const barWidth = Math.min((avg_streams_per_artist / 100) * 100, 100)

    return (
        <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                🎨 Loyalty vs Discovery
            </h3>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <div
                        className={`text-2xl font-bold ${classification.color}`}
                    >
                        {classification.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {avg_streams_per_artist.toFixed(1)} streams/artist
                        (average)
                    </div>
                </div>
                <div className="text-4xl">{classification.emoji}</div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-3 mb-3 overflow-hidden">
                <div
                    className={`${classification.barColor} h-3 rounded-full`}
                    style={{ width: `${barWidth}%` }}
                ></div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex-1 text-center">
                    <div
                        className={`text-2xl font-bold ${classification.color}`}
                    >
                        {unique_artists.toLocaleString()}
                    </div>
                    <div>Artists</div>
                </div>
                <div className="text-2xl">|</div>
                <div className="flex-1 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {total_streams.toLocaleString()}
                    </div>
                    <div>Streams</div>
                </div>
            </div>
        </div>
    )
}
