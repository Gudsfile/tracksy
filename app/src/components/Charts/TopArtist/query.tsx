import { TABLE } from '../../../db/queries/constants'

export function queryTopArtistByCount() {
    return `
SELECT
  master_metadata_album_artist_name AS artist_name,
  COUNT(*)::DOUBLE AS count_streams,
  SUM(ms_played)::DOUBLE AS ms_played
FROM ${TABLE}
WHERE master_metadata_album_artist_name IS NOT NULL
GROUP BY
  master_metadata_album_artist_name
ORDER BY
  count_streams DESC
LIMIT 1
`
}

export function queryTopArtistByDuration() {
    return `
SELECT
  master_metadata_album_artist_name AS artist_name,
  COUNT(*)::DOUBLE AS count_streams,
  SUM(ms_played)::DOUBLE AS ms_played
FROM ${TABLE}
WHERE master_metadata_album_artist_name IS NOT NULL
GROUP BY
  master_metadata_album_artist_name
ORDER BY
  ms_played DESC
LIMIT 1
`
}

export type TopArtistQueryResult = {
    artist_name: string
    count_streams: number
    ms_played: number
}
