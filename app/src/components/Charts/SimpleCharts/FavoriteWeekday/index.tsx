import { useEffect, useState } from 'react'
import { queryDBAsJSON } from '../../../../db/queries/queryDB'
import { queryFavoriteWeekday, FavoriteWeekdayResult } from './query'
import { FavoriteWeekday as FavoriteWeekdayView } from './FavoriteWeekday'

export function FavoriteWeekday({ year }: { year: number }) {
    const [data, setData] = useState<FavoriteWeekdayResult[]>([])

    useEffect(() => {
        const fetch = async () => {
            const sql = queryFavoriteWeekday(year)
            const result = await queryDBAsJSON<FavoriteWeekdayResult>(sql)
            setData(result)
        }
        fetch()
    }, [year])

    if (data.length === 0) return null
    return <FavoriteWeekdayView data={data} />
}
