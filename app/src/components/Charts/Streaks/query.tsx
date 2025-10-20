import { TABLE } from '../../../db/queries/constants'

export function queryStreaks() {
    return `SELECT day, 1 as played from (SELECT DISTINCT ts::DATE::TEXT as day FROM ${TABLE})`
}

export type StreaksQueryResult = {
    day: string
    played: number
}
