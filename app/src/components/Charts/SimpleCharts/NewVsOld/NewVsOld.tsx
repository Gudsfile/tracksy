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
        <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                🆕 New vs Old
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Streams this year
            </div>

            <div className="flex items-center gap-4 mb-4 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex-1 text-center">
                    <div className="text-2xl font-bold text-brand-purple">
                        {newPct.toFixed(0)}%
                    </div>
                    <div>Découvertes</div>
                </div>
                <div className="text-2xl">|</div>
                <div className="flex-1 text-center">
                    <div className="text-2xl font-bold text-brand-blue">
                        {oldPct.toFixed(0)}%
                    </div>
                    <div>Favorites</div>
                </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-3 mb-1 overflow-hidden flex">
                <div
                    className="bg-brand-purple h-full"
                    style={{ width: `${newPct}%` }}
                ></div>
                <div
                    className="bg-brand-blue h-full"
                    style={{ width: `${oldPct}%` }}
                ></div>
            </div>

            <div className="mt-4 text-xs text-center text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                    {new_artists_count.toLocaleString()}
                </span>{' '}
                new artists discovered this year! 🚀
            </div>
        </div>
    )
}
