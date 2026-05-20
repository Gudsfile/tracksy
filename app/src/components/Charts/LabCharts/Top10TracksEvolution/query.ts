import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTop10TracksEvolution from './Top10TracksEvolution.sql?raw'

export function queryTop10TracksEvolution() {
    return sqlQueryTop10TracksEvolution.replaceAll('${table}', TABLE)
}

export type Top10TracksEvolutionQueryResult = {
    stream_year: number
    track: string
    artist: string
    stream_rank: number
    play_count: number
}
