import type { FC } from 'react'
import type { TopAlbumsResult } from './query'
import { memo } from 'react'
import { ChartCard } from '../../../ChartCard/ChartCard'

type Props = {
    data: TopAlbumsResult[]
}

const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

export const TopAlbums: FC<Props> = memo(function TopAlbums({ data }) {
    return (
        <ChartCard title="Top Albums" emoji="💿">
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
        </ChartCard>
    )
})
