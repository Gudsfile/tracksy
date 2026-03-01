import type { FC } from 'react'
import type { TopArtistResult } from './query'
import { memo } from 'react'
import { formatDuration } from '../../../../utils/formatDuration'

type Props = {
    data: TopArtistResult[]
}

const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

export const TopArtist: FC<Props> = memo(function TopArtist({ data }) {
    return (
        <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                🎤 Top Artists
            </h3>
            <ul className="space-y-2" role="list">
                {data.map((artist, index) => (
                    <li
                        key={artist.artist_name}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        role="listitem"
                    >
                        <span className="text-xl flex-shrink-0">
                            {rankEmojis[index]}
                        </span>
                        <div
                            className="flex-1 min-w-0"
                            title={artist.artist_name}
                        >
                            <div className="font-medium truncate">
                                {artist.artist_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDuration(artist.ms_played).split(' ')[0]}
                            </div>
                        </div>
                        <div className="text-sm font-bold text-brand-purple dark:text-brand-purple flex-shrink-0">
                            {artist.count_streams.toLocaleString()}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
})
