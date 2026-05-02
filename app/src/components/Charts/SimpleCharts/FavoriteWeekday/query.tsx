import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryFavoriteWeekday from './FavoriteWeekday.sql?raw'

export type FavoriteWeekdayResult = {
    day_name: string
    stream_count: number
    pct: number
}

export function queryFavoriteWeekday(year: number | undefined) {
    const { condition, params } = buildYearCondition(year)
    return {
        sql: sqlQueryFavoriteWeekday
            .replaceAll('${table}', TABLE)
            .replaceAll('${year_condition}', condition),
        params,
    }
}
