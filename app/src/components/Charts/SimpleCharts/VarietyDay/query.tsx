import { TABLE } from '../../../../db/queries/constants'
import sqlQuery from './VarietyDay.sql?raw'

export type VarietyDayResult = {
    stream_date: string
    artist_count: number
}

export function buildVarietyDayQuery(): string {
    return sqlQuery.replaceAll('${table}', TABLE)
}
