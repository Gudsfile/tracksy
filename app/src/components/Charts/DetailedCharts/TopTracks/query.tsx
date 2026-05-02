import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryTopTracksByYear from './TopTracks.sql?raw'

export function queryTopTracksByYear(year: number | undefined) {
    const { condition, params } = buildYearCondition(year)
    return {
        sql: sqlQueryTopTracksByYear
            .replaceAll('${table}', TABLE)
            .replaceAll('${year_condition}', condition),
        params,
    }
}

export type TopTracksQueryResult = {
    track_name: string
    artist_name: string
    count_streams: number
    ms_played: number
}
