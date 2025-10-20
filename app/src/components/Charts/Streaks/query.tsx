import { TABLE } from '../../../db/queries/constants'

export function query() {
    return `SELECT day, 1 as played from (SELECT DISTINCT ts::DATE as day FROM ${TABLE})`
}

export type QueryResult = {
    day: number
    played: number
}
