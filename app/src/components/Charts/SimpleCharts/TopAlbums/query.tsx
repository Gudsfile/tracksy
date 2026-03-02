import { TABLE } from '../../../../db/queries/constants'

export type TopAlbumsResult = {
    album_name: string
    artist_name: string
    count_streams: number
    ms_played: number
}

export function queryTopAlbums(year: number): string {
    return `
    SELECT
      master_metadata_album_album_name AS album_name,
      artist_name AS artist_name,
      COUNT(*)::DOUBLE AS count_streams,
      SUM(ms_played)::DOUBLE AS ms_played
    FROM ${TABLE}
    WHERE master_metadata_album_album_name IS NOT NULL
      AND artist_name IS NOT NULL
      AND YEAR(ts::DATE) = ${year}
    GROUP BY master_metadata_album_album_name, artist_name
    ORDER BY count_streams DESC
    LIMIT 5
    `
}
