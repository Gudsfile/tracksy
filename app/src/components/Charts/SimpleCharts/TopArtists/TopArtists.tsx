import type { FC } from 'react'
import type { TopArtistsResult } from './query'
import { memo } from 'react'
import { formatDuration } from '../../../../utils/formatDuration'
import { ChartCard, RankedList } from '../shared'

type Props = {
    data: TopArtistsResult[]
}

export const TopArtists: FC<Props> = memo(function TopArtists({ data }) {
    const items = data.map((artist) => ({
        primary: artist.artist_name,
        secondary: formatDuration(artist.ms_played).split(' ')[0],
        score: artist.count_streams.toLocaleString(),
    }))

    return (
        <ChartCard title="Top Artists" emoji="🎤">
            <RankedList items={items} />
        </ChartCard>
    )
})
