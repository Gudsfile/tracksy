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

    const top =
        oldPct > newPct
            ? 'Comfort Listener'
            : oldPct < newPct
              ? 'Trend Hunter'
              : 'Balanced Tast'

    return (
        <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <h3
                className="text-lg font-semibold mb-3 flex items-center gap-2"
                title="Comfort zone or discovery mode?"
            >
                🆕 Fresh vs Familiar
            </h3>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-2xl font-bold">{top}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400"></div>
                </div>
                <div className="text-4xl"></div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-xs text-gray-600 dark:text-gray-400">
                <div role="list" className="flex-1 text-center contents">
                    <div role="listitem" className="flex-1 text-center">
                        <div className="text-2xl font-bold text-brand-purple">
                            {newPct.toFixed(0)}%
                        </div>
                        <div>Discoveries</div>
                    </div>
                    <div className="text-2xl" role="separator">
                        |
                    </div>
                    <div role="listitem" className="flex-1 text-center">
                        <div className="text-2xl font-bold text-brand-blue">
                            {oldPct.toFixed(0)}%
                        </div>
                        <div>Favorites</div>
                    </div>
                </div>
            </div>

            <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-3 mb-3 overflow-hidden flex">
                <div
                    className="bg-brand-purple h-full"
                    style={{ width: `${newPct}%` }}
                ></div>
                <div
                    className="bg-brand-blue h-full"
                    style={{ width: `${oldPct}%` }}
                ></div>
            </div>

            <div className="text-sm text-center font-medium text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-slate-700/50 p-2 rounded-lg">
                {new_artists_count.toLocaleString()} new artists discovered this
                year!
            </div>
        </div>
    )
}
