import { TABLE } from '../../../../db/queries/constants'
import sqlQuery from './UnbeatableStreak.sql?raw'

export type UnbeatableStreakResult = {
    streak_days: number
    start_date: string
    end_date: string
}

export function buildUnbeatableStreakQuery(): string {
    return sqlQuery.replaceAll('${table}', TABLE)
}
