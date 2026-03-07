import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryTopArtists, TopArtistsResult } from './query'
import { TopArtists as TopArtistsView } from './TopArtists'

export function TopArtists({ year }: { year: number }) {
    const { data } = useDBQueryMany<TopArtistsResult>({
        query: queryTopArtists(year),
        year,
    })

    if (!data?.length) return null
    return <TopArtistsView data={data} />
}
