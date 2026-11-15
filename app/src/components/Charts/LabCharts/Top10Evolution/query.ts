import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTop10ArtistsEvolution from './Top10ArtistsEvolution.sql?raw'

export function queryTop10Evolution(year?: number) {
    const yearFilter = year ? `AND year(ts::datetime) <= ${year}` : ''
    return sqlQueryTop10ArtistsEvolution
        .replaceAll('${table}', TABLE)
        .replace('${yearFilter}', yearFilter)
}

export type Top10EvolutionQueryResult = {
    stream_year: number
    artist: string
    stream_rank: number
    play_count: number
}
