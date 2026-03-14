import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTopStreak from './TopStreak.sql?raw'

export function queryTopStreak() {
    return sqlQueryTopStreak
        .replaceAll('${table}', TABLE)
        .replaceAll('${order_condition}', 'streaks DESC')
}

export function queryCurrentStreak() {
    return sqlQueryTopStreak
        .replaceAll('${table}', TABLE)
        .replaceAll('${order_condition}', 'end_ts DESC')
}

export type TopStreakQueryResult = {
    start_ts: number
    end_ts: number
    streaks: number
}
