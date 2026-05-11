import { TABLE } from '../../../../db/queries/constants'
import sqlQuery from './VarietyDay.sql?raw'

export type VarietyDayResult = {
    date: string
    artist_count: number
}

export function buildVarietyDayQuery(): string {
    return sqlQuery.replaceAll('${table}', TABLE)
}
