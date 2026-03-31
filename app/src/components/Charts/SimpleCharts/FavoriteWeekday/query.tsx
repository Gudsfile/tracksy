import { TABLE } from '../../../../db/queries/constants'
import sqlQueryFavoriteWeekday from './FavoriteWeekday.sql?raw'

export type FavoriteWeekdayResult = {
    day_name: string
    stream_count: number
    pct: number
}

export function queryFavoriteWeekday(year: number | undefined): string {
    const yearCondition =
        year !== undefined ? `year(ts::date) = ${year}` : '1=1'
    return sqlQueryFavoriteWeekday
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
