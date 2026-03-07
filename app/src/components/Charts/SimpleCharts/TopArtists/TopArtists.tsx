import type { FC } from 'react'
import type { TopArtistsResult } from './query'
import { memo } from 'react'
import { formatDuration } from '../../../../utils/formatDuration'
import { ChartCard } from '../../../ChartCard/ChartCard'

type Props = {
    data: TopArtistsResult[]
}

const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

export const TopArtists: FC<Props> = memo(function TopArtists({ data }) {
    return (
        <ChartCard title="Top Artists" emoji="🎤">
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
        </ChartCard>
    )
})
