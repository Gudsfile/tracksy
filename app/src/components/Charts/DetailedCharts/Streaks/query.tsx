import { TABLE } from '../../../../db/queries/constants'
import sqlQueryStreaks from './Streaks.sql?raw'

export function queryStreaks() {
    return sqlQueryStreaks.replaceAll('${table}', TABLE)
}

export type StreaksQueryResult = {
    day: string
    played: number
}
