import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryTopArtistsByYear from './TopArtists.sql?raw'

export function queryTopArtistsByYear(year: number | undefined) {
    const { condition, params } = buildYearCondition(year)
    return {
        sql: sqlQueryTopArtistsByYear
            .replaceAll('${table}', TABLE)
            .replaceAll('${year_condition}', condition),
        params,
    }
}

export type TopArtistsQueryResult = {
    artist_name: string
    count_streams: number
    ms_played: number
}
