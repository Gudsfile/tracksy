import { useDBQueryMany } from '../../../../hooks/useDBQuery'
import { queryFavoriteWeekday, type FavoriteWeekdayResult } from './query'
import { FavoriteWeekday as FavoriteWeekdayView } from './FavoriteWeekday'

export function FavoriteWeekday({ year }: { year: number | undefined }) {
    const { data, isLoading } = useDBQueryMany<FavoriteWeekdayResult>({
        query: queryFavoriteWeekday(year),
        year,
    })

    if (!isLoading && !data?.length) return null
    return <FavoriteWeekdayView data={data} isLoading={isLoading} />
}
