import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryTopAlbums, type TopAlbumsResult } from './query'
import { TopAlbums as TopAlbumsView } from './TopAlbums'

export function TopAlbums({ year }: { year: number }) {
    const { data } = useDBQueryMany<TopAlbumsResult>({
        query: queryTopAlbums(year),
        year,
    })

    if (!data?.length) return null
    return <TopAlbumsView data={data} />
}
