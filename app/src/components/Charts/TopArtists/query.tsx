import { TABLE } from '../../../db/queries/constants'

export function queryByYear(year: number | undefined) {
    return `
SELECT
  master_metadata_album_artist_name AS artist_name,
  COUNT(*) AS count_streams,
  SUM(ms_played) AS ms_played
FROM ${TABLE}
${year ? `WHERE YEAR(ts:: DATETIME) = ${year}` : ''}
GROUP BY master_metadata_album_artist_name
ORDER BY count_streams DESC
LIMIT 10
`
}

export type QueryResult = {
    artist_name: string
    count_streams: bigint
    ms_played: bigint
}
