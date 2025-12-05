import type { FC } from 'react'
import type { NewVsOldResult } from './query'

type Props = {
    data: NewVsOldResult
}

export const NewVsOld: FC<Props> = ({ data }) => {
    const {
        new_artists_streams,
        old_artists_streams,
        new_artists_count,
        total,
    } = data

    const newPct = total ? (new_artists_streams / total) * 100 : 0
    const oldPct = total ? (old_artists_streams / total) * 100 : 0

    return (
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
                🆕 New vs Old
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Streams this year
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 text-center">
                    <div className="text-2xl font-bold text-purple-500">
                        {newPct.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">Découvertes</div>
                </div>
                <div className="text-gray-300">|</div>
                <div className="flex-1 text-center">
                    <div className="text-2xl font-bold text-blue-500">
                        {oldPct.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">Favorites</div>
                </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden flex">
                <div
                    className="bg-purple-500 h-full"
                    style={{ width: `${newPct}%` }}
                ></div>
                <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${oldPct}%` }}
                ></div>
            </div>

            <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                    {new_artists_count.toLocaleString()}
                </span>{' '}
                new artists discovered this year! 🚀
            </div>
        </div>
    )
}
