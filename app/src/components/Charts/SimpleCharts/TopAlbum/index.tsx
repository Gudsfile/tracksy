import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryTopAlbum, TopAlbumResult } from './query'
import { TopAlbum as TopAlbumView } from './TopAlbum'

export function TopAlbum({ year }: { year: number }) {
    const [data, setData] = useState<TopAlbumResult[]>([])

    useEffect(() => {
        const fetch = async () => {
            const sql = queryTopAlbum(year)
            const result = await queryDBAsJSON<TopAlbumResult>(sql)
            if (result && result.length > 0) setData(result)
        }
        fetch()
    }, [year])

    if (data.length === 0) return null
    return <TopAlbumView data={data} />
}
