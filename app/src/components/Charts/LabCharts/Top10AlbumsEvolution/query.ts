import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTop10AlbumsEvolution from './Top10AlbumsEvolution.sql?raw'

export function queryTop10AlbumsEvolution() {
    return sqlQueryTop10AlbumsEvolution.replaceAll('${table}', TABLE)
}

export type Top10AlbumsEvolutionQueryResult = {
    stream_year: number
    album: string
    artist: string
    stream_rank: number
    play_count: number
}
