import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTopArtists from './TopArtists.sql?raw'

export type TopArtistsResult = {
    artist_name: string
    count_streams: number
    ms_played: number
}

export function queryTopArtists(year: number): string {
    return sqlQueryTopArtists
        .replaceAll('${table}', TABLE)
        .replaceAll('${year}', String(year))
}
