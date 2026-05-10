import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryTopAlbums, type TopAlbumsResult } from './query'
import { TopAlbums as TopAlbumsView } from './TopAlbums'

export function TopAlbums({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryMany<TopAlbumsResult>({
        query: queryTopAlbums(year),
        year,
    })

    return <TopAlbumsView data={data} isLoading={isLoading} />
}
