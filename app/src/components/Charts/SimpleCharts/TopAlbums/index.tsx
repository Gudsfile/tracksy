import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryTopAlbums, TopAlbumsResult } from './query'
import { TopAlbums as TopAlbumsView } from './TopAlbums'

export function TopAlbums({ year }: { year: number }) {
    const [data, setData] = useState<TopAlbumsResult[]>([])

    useEffect(() => {
        const fetch = async () => {
            const sql = queryTopAlbums(year)
            const result = await queryDBAsJSON<TopAlbumsResult>(sql)
            if (result && result.length > 0) setData(result)
        }
        fetch()
    }, [year])

    if (data.length === 0) return null
    return <TopAlbumsView data={data} />
}
