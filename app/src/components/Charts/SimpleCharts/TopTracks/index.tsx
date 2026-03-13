import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryTopTracks, type TopTracksResult } from './query'
import { TopTracks as TopTracksView } from './TopTracks'

export function TopTracks({ year }: { year: number }) {
    const { data } = useDBQueryMany<TopTracksResult>({
        query: queryTopTracks(year),
        year,
    })

    if (!data?.length) return null
    return <TopTracksView data={data} />
}
