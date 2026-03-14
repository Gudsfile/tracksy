import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTopArtistsByYear from './TopArtists.sql?raw'

export function queryTopArtistsByYear(year: number | undefined) {
    const yearCondition = year ? `YEAR(ts:: DATETIME) = ${year}` : '1=1'
    return sqlQueryTopArtistsByYear
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}

export type TopArtistsQueryResult = {
    artist_name: string
    count_streams: number
    ms_played: number
}
