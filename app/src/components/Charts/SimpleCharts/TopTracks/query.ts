import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryTopTracks from './TopTracks.sql?raw'

export type TopTracksResult = {
    track_name: string
    artist_name: string
    count_streams: number
    ms_played: number
}

export function queryTopTracks(year: number | undefined): string {
    const yearCondition = buildYearCondition(year)
    return sqlQueryTopTracks
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
