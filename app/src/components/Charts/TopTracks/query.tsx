import { TABLE } from '../../../db/queries/constants'

export function queryTopTracksByYear(year: number | undefined) {
    return `
SELECT
  master_metadata_track_name AS track_name,
  master_metadata_album_artist_name AS artist_name,
  COUNT(*)::DOUBLE AS count_streams,
  SUM(ms_played)::DOUBLE AS ms_played
FROM ${TABLE}
${year ? `WHERE YEAR(ts:: DATETIME) = ${year}` : ''}
GROUP BY spotify_track_uri, master_metadata_track_name, master_metadata_album_artist_name
ORDER BY count_streams DESC, ms_played DESC
LIMIT 10
`
}

export type TopTracksQueryResult = {
    track_name: string
    artist_name: string
    count_streams: number
    ms_played: number
}
