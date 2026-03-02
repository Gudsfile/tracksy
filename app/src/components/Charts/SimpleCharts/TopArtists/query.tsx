import { TABLE } from '../../../../db/queries/constants'

export type TopArtistsResult = {
    artist_name: string
    count_streams: number
    ms_played: number
}

export function queryTopArtists(year: number): string {
    return `
    SELECT
      artist_name AS artist_name,
      COUNT(*)::DOUBLE AS count_streams,
      SUM(ms_played)::DOUBLE AS ms_played
    FROM ${TABLE}
    WHERE artist_name IS NOT NULL
      AND YEAR(ts::DATE) = ${year}
    GROUP BY artist_name
    ORDER BY count_streams DESC
    LIMIT 5
    `
}
