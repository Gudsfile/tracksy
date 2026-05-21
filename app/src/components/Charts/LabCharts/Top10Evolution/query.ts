import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTop10Evolution from './Top10Evolution.sql?raw'

export function queryTop10Evolution() {
    return sqlQueryTop10Evolution.replaceAll('${table}', TABLE)
}

export type Top10EvolutionQueryResult = {
    stream_date_ts: number
    artist: string
    play_count: number
}
