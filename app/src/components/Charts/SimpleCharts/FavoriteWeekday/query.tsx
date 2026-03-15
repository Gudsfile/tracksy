import { TABLE } from '../../../../db/queries/constants'
import sqlQueryFavoriteWeekday from './FavoriteWeekday.sql?raw'

export type FavoriteWeekdayResult = {
    day_name: string
    stream_count: number
    pct: number
}

export function queryFavoriteWeekday(year: number): string {
    return sqlQueryFavoriteWeekday
        .replaceAll('${table}', TABLE)
        .replaceAll('${year}', String(year))
}
