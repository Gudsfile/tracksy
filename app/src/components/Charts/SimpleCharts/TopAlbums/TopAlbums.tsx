import type { FC } from 'react'
import type { TopAlbumsResult } from './query'
import { memo } from 'react'

type Props = {
    data: TopAlbumsResult[]
}

const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

export const TopAlbums: FC<Props> = memo(function TopAlbums({ data }) {
    return (
        <div className="group p-6 bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-slate-700/50 text-gray-900 dark:text-gray-100 transition-all duration-300 hover:shadow-glass-lg hover:scale-[1.01] animate-fade-in">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                💿 Top Albums
            </h3>
            <ul className="space-y-2" role="list">
                {data.map((album, index) => (
                    <li
                        key={`${album.album_name}-${album.artist_name}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        role="listitem"
                    >
                        <span className="text-xl flex-shrink-0">
                            {rankEmojis[index]}
                        </span>
                        <div
                            className="flex-1 min-w-0"
                            title={album.album_name}
                        >
                            <div className="font-medium truncate">
                                {album.album_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {album.artist_name}
                            </div>
                        </div>
                        <div className="text-sm font-bold text-brand-purple dark:text-brand-purple flex-shrink-0">
                            {album.count_streams.toLocaleString()}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
})
