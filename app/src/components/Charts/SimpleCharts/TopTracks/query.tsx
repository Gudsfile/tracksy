import { TABLE } from '../../../../db/queries/constants'

export type TopTracksResult = {
    track_name: string
    artist_name: string
    count_streams: number
    ms_played: number
}

export function queryTopTracks(year: number): string {
    return `
    SELECT
      track_name AS track_name,
      artist_name AS artist_name,
      COUNT(*)::DOUBLE AS count_streams,
      SUM(ms_played)::DOUBLE AS ms_played
    FROM ${TABLE}
    WHERE track_name IS NOT NULL
      AND artist_name IS NOT NULL
      AND YEAR(ts::DATE) = ${year}
    GROUP BY track_name, artist_name
    ORDER BY count_streams DESC
    LIMIT 5
    `
}
