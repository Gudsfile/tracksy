import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTopTracks from './TopTracks.sql?raw'

export type TopTracksResult = {
    track_name: string
    artist_name: string
    count_streams: number
    ms_played: number
}

export function queryTopTracks(year: number | undefined): string {
    const yearCondition =
        year !== undefined ? `year(ts::date) = ${year}` : '1=1'
    return sqlQueryTopTracks
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
