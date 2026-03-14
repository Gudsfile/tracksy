import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTopTracks from './TopTracks.sql?raw'

export type TopTracksResult = {
    track_name: string
    artist_name: string
    count_streams: number
    ms_played: number
}

export function queryTopTracks(year: number): string {
    return sqlQueryTopTracks
        .replaceAll('${table}', TABLE)
        .replaceAll('${year}', String(year))
}
