import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryTopArtists, type TopArtistsResult } from './query'
import { TopArtists as TopArtistsView } from './TopArtists'

export function TopArtists({ year }: { year: number | undefined }) {
    const { sql, params } = queryTopArtists(year)
    const { data } = useDBQueryMany<TopArtistsResult>({
        query: sql,
        params,
        year,
    })

    if (!data?.length) return null
    return <TopArtistsView data={data} />
}
