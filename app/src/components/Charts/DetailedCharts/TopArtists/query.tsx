import { TABLE } from '../../../../db/queries/constants'

export function queryTopArtistsByYear(year: number | undefined) {
    return `
SELECT
  artist_name AS artist_name,
  COUNT(*)::DOUBLE AS count_streams,
  SUM(ms_played)::DOUBLE AS ms_played
FROM ${TABLE}
${year ? `WHERE YEAR(ts:: DATETIME) = ${year}` : ''}
GROUP BY artist_name
ORDER BY count_streams DESC
LIMIT 10
`
}

export type TopArtistsQueryResult = {
    artist_name: string
    count_streams: number
    ms_played: number
}
