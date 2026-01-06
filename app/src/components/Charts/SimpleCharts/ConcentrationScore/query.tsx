import { TABLE } from '../../../../db/queries/constants'

export type ConcentrationResult = {
    top5_pct: number
    top10_pct: number
    top20_pct: number
}

export function queryConcentrationScore(year: number): string {
    return `
    WITH artist_streams AS (
      SELECT
        master_metadata_album_artist_name AS artist,
        COUNT(*) AS stream_count
      FROM ${TABLE}
      WHERE master_metadata_album_artist_name IS NOT NULL
      AND YEAR(ts::DATE) = ${year}
      GROUP BY master_metadata_album_artist_name
    ),
    ranked_artists AS (
      SELECT
        artist,
        stream_count,
        ROW_NUMBER() OVER (ORDER BY stream_count DESC) AS rank
      FROM artist_streams
    ),
    total_streams AS (
      SELECT COUNT(*) AS total FROM ${TABLE} WHERE YEAR(ts::DATE) = ${year}
    )
    SELECT
      COALESCE((SELECT SUM(stream_count) FROM ranked_artists WHERE rank <= 5)::DOUBLE / (SELECT total FROM total_streams)::DOUBLE * 100, 0) AS top5_pct,
      COALESCE((SELECT SUM(stream_count) FROM ranked_artists WHERE rank <= 10)::DOUBLE / (SELECT total FROM total_streams)::DOUBLE * 100, 0) AS top10_pct,
      COALESCE((SELECT SUM(stream_count) FROM ranked_artists WHERE rank <= 20)::DOUBLE / (SELECT total FROM total_streams)::DOUBLE * 100, 0) AS top20_pct
  `
}
