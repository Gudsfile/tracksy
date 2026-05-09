import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryTopArtists, type TopArtistsResult } from './query'
import { TopArtists as TopArtistsView } from './TopArtists'

export function TopArtists({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryMany<TopArtistsResult>({
        query: queryTopArtists(year),
        year,
    })

    if (!isLoading && !data?.length) return null
    return <TopArtistsView data={data} isLoading={isLoading} />
}
