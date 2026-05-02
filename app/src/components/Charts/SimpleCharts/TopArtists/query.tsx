import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryTopArtists from './TopArtists.sql?raw'

export type TopArtistsResult = {
    artist_name: string
    count_streams: number
    ms_played: number
}

export function queryTopArtists(year: number | undefined) {
    const { condition, params } = buildYearCondition(year)
    return {
        sql: sqlQueryTopArtists
            .replaceAll('${table}', TABLE)
            .replaceAll('${year_condition}', condition),
        params,
    }
}
