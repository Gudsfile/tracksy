import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryFavoriteWeekday from './FavoriteWeekday.sql?raw'

export type FavoriteWeekdayResult = {
    day_name: string
    stream_count: number
    ms_played: number
    pct: number
}

export function queryFavoriteWeekday(year: number | undefined): string {
    const yearCondition = buildYearCondition(year)
    return sqlQueryFavoriteWeekday
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
