import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import { TABLE } from '../../../../db/queries/constants'
import sqlQueryStreaks from './Streaks.sql?raw'

export function queryStreaks(year?: number) {
    return sqlQueryStreaks
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', buildYearCondition(year))
}

export type StreaksQueryResult = {
    stream_date: string
    played: number
}
