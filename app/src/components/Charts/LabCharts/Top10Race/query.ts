import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTop10Race from './Top10Race.sql?raw'

export function queryTop10Race(year?: number) {
    let query = sqlQueryTop10Race.replaceAll('${table}', TABLE)
    if (year) {
        query = query.replace(
            '${yearFilter}',
            `AND year(ts::datetime) = ${year}`
        )
    } else {
        query = query.replace('${yearFilter}', '')
    }
    return query
}

export type Top10RaceQueryResult = {
    stream_date_ts: number
    artist: string
    play_count: number
}
