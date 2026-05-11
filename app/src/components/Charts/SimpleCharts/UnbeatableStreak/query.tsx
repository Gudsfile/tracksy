import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQuery from './UnbeatableStreak.sql?raw'

export type UnbeatableStreakResult = {
    streak_days: number
    start_date: string
    end_date: string
}

export function buildUnbeatableStreakQuery(year: number | undefined): string {
    const yearCondition = buildYearCondition(year)
    return sqlQuery
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
