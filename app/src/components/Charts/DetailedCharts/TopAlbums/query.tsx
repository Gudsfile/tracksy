import { TABLE } from '../../../../db/queries/constants'

export function queryTopAlbumsByYear(year: number | undefined) {
    return `
SELECT
  album_name AS album_name,
  COUNT(*)::DOUBLE AS count_streams,
  SUM(ms_played)::DOUBLE AS ms_played
FROM ${TABLE}
${year ? `WHERE YEAR(ts:: DATETIME) = ${year}` : ''}
GROUP BY album_name
ORDER BY count_streams DESC
LIMIT 10
`
}

export type TopAlbumsQueryResult = {
    album_name: string
    count_streams: number
    ms_played: number
}
