import type { FC } from 'react'
import type { TopAlbumsResult } from './query'
import { memo } from 'react'
import { ChartCard, ChartCardEmpty, RankedList } from '../shared'

type Props = {
    data: TopAlbumsResult[] | undefined
    isLoading?: boolean
}

export const TopAlbums: FC<Props> = memo(function TopAlbums({
    data,
    isLoading,
}) {
    const items = (data ?? []).map((album) => ({
        primary: album.album_name,
        secondary: album.artist_name,
        score: album.count_streams.toLocaleString(),
    }))

    return (
        <ChartCard title="Top Albums" emoji="💿" isLoading={isLoading}>
            {!data?.length ? <ChartCardEmpty /> : <RankedList items={items} />}
        </ChartCard>
    )
})
