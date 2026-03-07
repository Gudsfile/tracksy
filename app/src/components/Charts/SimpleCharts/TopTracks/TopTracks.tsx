import type { FC } from 'react'
import type { TopTracksResult } from './query'
import { memo } from 'react'
import { ChartCard } from '../../../ChartCard/ChartCard'

type Props = {
    data: TopTracksResult[]
}

const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']

export const TopTracks: FC<Props> = memo(function TopTracks({ data }) {
    return (
        <ChartCard title="Top Tracks" emoji="🎵">
            <ul className="space-y-2" role="list">
                {data.map((track, index) => (
                    <li
                        key={`${track.track_name}-${track.artist_name}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        role="listitem"
                    >
                        <span className="text-xl flex-shrink-0">
                            {rankEmojis[index]}
                        </span>
                        <div
                            className="flex-1 min-w-0"
                            title={track.track_name}
                        >
                            <div className="font-medium truncate">
                                {track.track_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {track.artist_name}
                            </div>
                        </div>
                        <div className="text-sm font-bold text-brand-purple dark:text-brand-purple flex-shrink-0">
                            {track.count_streams.toLocaleString()}
                        </div>
                    </li>
                ))}
            </ul>
        </ChartCard>
    )
})
