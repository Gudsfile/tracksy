import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTopArtist from './TopArtist.sql?raw'

export function queryTopArtistByCount() {
    return sqlQueryTopArtist
        .replaceAll('${table}', TABLE)
        .replaceAll('${order_condition}', 'count_streams DESC')
}

export function queryTopArtistByDuration() {
    return sqlQueryTopArtist
        .replaceAll('${table}', TABLE)
        .replaceAll('${order_condition}', 'ms_played DESC')
}

export type TopArtistQueryResult = {
    artist_name: string
    count_streams: number
    ms_played: number
}
