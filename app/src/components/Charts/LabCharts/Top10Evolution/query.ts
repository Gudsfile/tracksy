import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTop10Evolution from './Top10Evolution.sql?raw'

export function queryTop10Evolution(year?: number) {
    let query = sqlQueryTop10Evolution.replaceAll('${table}', TABLE)
    if (year) {
        query = query.replace('${yearFilter}', `AND year(ts::datetime) = ${year}`)
    } else {
        query = query.replace('${yearFilter}', '')
    }
    return query
}

export type Top10EvolutionQueryResult = {
    stream_date_ts: number
    artist: string
    play_count: number
}
