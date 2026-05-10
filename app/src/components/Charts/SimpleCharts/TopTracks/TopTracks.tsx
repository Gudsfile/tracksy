import type { FC } from 'react'
import type { TopTracksResult } from './query'
import { memo } from 'react'
import { ChartCard, ChartCardEmpty, RankedList } from '../shared'

type Props = {
    data: TopTracksResult[] | undefined
    isLoading?: boolean
}

export const TopTracks: FC<Props> = memo(function TopTracks({
    data,
    isLoading,
}) {
    const items = (data ?? []).map((track) => ({
        primary: track.track_name,
        secondary: track.artist_name,
        score: track.count_streams.toLocaleString(),
    }))

    return (
        <ChartCard title="Top Tracks" emoji="🎵" isLoading={isLoading}>
            {!data?.length ? <ChartCardEmpty /> : <RankedList items={items} />}
        </ChartCard>
    )
})
