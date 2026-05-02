import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryFavoriteWeekday, type FavoriteWeekdayResult } from './query'
import { FavoriteWeekday as FavoriteWeekdayView } from './FavoriteWeekday'

export function FavoriteWeekday({ year }: { year: number | undefined }) {
    const { sql, params } = queryFavoriteWeekday(year)
    const { data } = useDBQueryMany<FavoriteWeekdayResult>({
        query: sql,
        params,
        year,
    })

    if (!data?.length) return null
    return <FavoriteWeekdayView data={data} />
}
