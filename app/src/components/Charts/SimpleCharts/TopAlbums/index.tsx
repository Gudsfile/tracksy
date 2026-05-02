import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryTopAlbums, type TopAlbumsResult } from './query'
import { TopAlbums as TopAlbumsView } from './TopAlbums'

export function TopAlbums({ year }: { year: number | undefined }) {
    const { sql, params } = queryTopAlbums(year)
    const { data } = useDBQueryMany<TopAlbumsResult>({
        query: sql,
        params,
        year,
    })

    if (!data?.length) return null
    return <TopAlbumsView data={data} />
}
