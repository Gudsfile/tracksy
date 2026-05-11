import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTop10AlbumsEvolution from './Top10AlbumsEvolution.sql?raw'

export function queryTop10AlbumsEvolution() {
    return sqlQueryTop10AlbumsEvolution.replaceAll('${table}', TABLE)
}

export type Top10AlbumsEvolutionQueryResult = {
    year: number
    album: string
    artist: string
    rank: number
    play_count: number
}
