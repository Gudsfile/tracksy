import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTop10Evolution from './Top10Evolution.sql?raw'

export function queryTop10Evolution(year?: number) {
    const yearFilter = year ? `AND year(ts::datetime) <= ${year}` : ''
    return sqlQueryTop10Evolution
        .replaceAll('${table}', TABLE)
        .replace('${yearFilter}', yearFilter)
}

export type Top10EvolutionQueryResult = {
    stream_year: number
    artist: string
    stream_rank: number
    play_count: number
}
