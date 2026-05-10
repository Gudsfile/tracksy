import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryTopTracks, type TopTracksResult } from './query'
import { TopTracks as TopTracksView } from './TopTracks'

export function TopTracks({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryMany<TopTracksResult>({
        query: queryTopTracks(year),
        year,
    })

    return <TopTracksView data={data} isLoading={isLoading} />
}
