import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQuery from './VarietyDay.sql?raw'

export type VarietyDayResult = {
    date: string
    artist_count: number
}

export function buildVarietyDayQuery(year: number | undefined): string {
    const yearCondition = buildYearCondition(year)
    return sqlQuery
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
