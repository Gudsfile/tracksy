import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTop10Evolution from './Top10Evolution.sql?raw'

export function queryTop10Evolution() {
    return sqlQueryTop10Evolution.replaceAll('${table}', TABLE)
}

export type Top10EvolutionQueryResult = {
    year: number
    artist: string
    rank: number
    play_count: number
}
