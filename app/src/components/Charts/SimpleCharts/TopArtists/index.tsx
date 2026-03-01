import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryTopArtists, TopArtistsResult } from './query'
import { TopArtists as TopArtistsView } from './TopArtists'

export function TopArtists({ year }: { year: number }) {
    const [data, setData] = useState<TopArtistsResult[]>([])

    useEffect(() => {
        const fetch = async () => {
            const sql = queryTopArtists(year)
            const result = await queryDBAsJSON<TopArtistsResult>(sql)
            if (result && result.length > 0) setData(result)
        }
        fetch()
    }, [year])

    if (data.length === 0) return null
    return <TopArtistsView data={data} />
}
