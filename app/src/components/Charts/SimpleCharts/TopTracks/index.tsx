import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryTopTracks, type TopTracksResult } from './query'
import { TopTracks as TopTracksView } from './TopTracks'

export function TopTracks({ year }: { year: number | undefined }) {
    const { sql, params } = queryTopTracks(year)
    const { data } = useDBQueryMany<TopTracksResult>({
        query: sql,
        params,
        year,
    })

    if (!data?.length) return null
    return <TopTracksView data={data} />
}
