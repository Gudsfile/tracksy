import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTopArtists from './TopArtists.sql?raw'

export type TopArtistsResult = {
    artist_name: string
    count_streams: number
    ms_played: number
}

export function queryTopArtists(year: number | undefined): string {
    const yearCondition =
        year !== undefined ? `year(ts::date) = ${year}` : '1=1'
    return sqlQueryTopArtists
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
