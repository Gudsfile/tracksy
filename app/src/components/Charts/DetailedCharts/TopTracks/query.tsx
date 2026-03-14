import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTopTracksByYear from './TopTracks.sql?raw'

export function queryTopTracksByYear(year: number | undefined) {
    const yearCondition = year ? `YEAR(ts:: DATETIME) = ${year}` : '1=1'
    return sqlQueryTopTracksByYear
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}

export type TopTracksQueryResult = {
    track_name: string
    artist_name: string
    count_streams: number
    ms_played: number
}
