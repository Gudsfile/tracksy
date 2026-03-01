import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryTopTrack, TopTrackResult } from './query'
import { TopTrack as TopTrackView } from './TopTrack'

export function TopTrack({ year }: { year: number }) {
    const [data, setData] = useState<TopTrackResult[]>([])

    useEffect(() => {
        const fetch = async () => {
            const sql = queryTopTrack(year)
            const result = await queryDBAsJSON<TopTrackResult>(sql)
            if (result && result.length > 0) setData(result)
        }
        fetch()
    }, [year])

    if (data.length === 0) return null
    return <TopTrackView data={data} />
}
