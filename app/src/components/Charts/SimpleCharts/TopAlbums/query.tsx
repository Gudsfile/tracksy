import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTopAlbums from './TopAlbums.sql?raw'

export type TopAlbumsResult = {
    album_name: string
    artist_name: string
    count_streams: number
    ms_played: number
}

export function queryTopAlbums(year: number | undefined): string {
    const yearCondition =
        year !== undefined ? `year(ts::date) = ${year}` : '1=1'
    return sqlQueryTopAlbums
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
