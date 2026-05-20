import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryTopArtistsByYear from './TopArtists.sql?raw'

export function queryTopArtistsByYear(year: number | undefined) {
    const yearCondition = buildYearCondition(year)
    return sqlQueryTopArtistsByYear
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}

export type TopArtistsQueryResult = {
    artist_name: string
    count_streams: number
    ms_played: number
}
