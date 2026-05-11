import { TABLE } from '../../../../db/queries/constants'
import { buildYearCondition } from '../../../../db/queries/buildYearCondition'
import sqlQueryTopAlbums from './TopAlbums.sql?raw'

export type TopAlbumsResult = {
    album_name: string
    artist_name: string
    count_streams: number
    ms_played: number
}

export function queryTopAlbums(year: number | undefined): string {
    const yearCondition = buildYearCondition(year)
    return sqlQueryTopAlbums
        .replaceAll('${table}', TABLE)
        .replaceAll('${year_condition}', yearCondition)
}
