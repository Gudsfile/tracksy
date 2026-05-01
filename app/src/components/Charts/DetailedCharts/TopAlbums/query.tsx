import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryTopAlbumsByYear from './TopAlbums.sql?raw'

export function queryTopAlbumsByYear(year: number | undefined) {
    const yearCondition = buildYearCondition(year)
    return sqlQueryTopAlbumsByYear
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}

export type TopAlbumsQueryResult = {
    album_name: string
    count_streams: number
    ms_played: number
}
