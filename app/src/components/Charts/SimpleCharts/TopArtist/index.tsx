import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryTopArtist, TopArtistResult } from './query'
import { TopArtist as TopArtistView } from './TopArtist'

export function TopArtist({ year }: { year: number }) {
    const [data, setData] = useState<TopArtistResult[]>([])

    useEffect(() => {
        const fetch = async () => {
            const sql = queryTopArtist(year)
            const result = await queryDBAsJSON<TopArtistResult>(sql)
            if (result && result.length > 0) setData(result)
        }
        fetch()
    }, [year])

    if (data.length === 0) return null
    return <TopArtistView data={data} />
}
