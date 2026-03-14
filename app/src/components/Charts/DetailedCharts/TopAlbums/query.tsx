import { TABLE } from '../../../../db/queries/constants'
import sqlQueryTopAlbumsByYear from './TopAlbums.sql?raw'

export function queryTopAlbumsByYear(year: number | undefined) {
    const yearCondition = year ? `YEAR(ts:: DATETIME) = ${year}` : '1=1'
    return sqlQueryTopAlbumsByYear
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}

export type TopAlbumsQueryResult = {
    album_name: string
    count_streams: number
    ms_played: number
}
