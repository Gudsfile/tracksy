import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryTopTracks, TopTracksResult } from './query'
import { TopTracks as TopTracksView } from './TopTracks'

export function TopTracks({ year }: { year: number }) {
    const [data, setData] = useState<TopTracksResult[]>([])

    useEffect(() => {
        const fetch = async () => {
            const sql = queryTopTracks(year)
            const result = await queryDBAsJSON<TopTracksResult>(sql)
            if (result && result.length > 0) setData(result)
        }
        fetch()
    }, [year])

    if (data.length === 0) return null
    return <TopTracksView data={data} />
}
