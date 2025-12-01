import { TABLE } from '../../../../db/queries/constants'

export type NewVsOldResult = {
    new_artists_streams: number
    old_artists_streams: number
    new_artists_count: number
    total: number
}

export function queryNewVsOld(): string {
    return `
    WITH current_year AS (
      SELECT MAX(YEAR(ts::DATE)) AS year FROM ${TABLE}
    ),
    artist_first_listen AS (
      SELECT
        master_metadata_album_artist_name AS artist,
        MIN(YEAR(ts::DATE)) AS first_year
      FROM ${TABLE}
      WHERE master_metadata_album_artist_name IS NOT NULL
      GROUP BY master_metadata_album_artist_name
    ),
    streams_classified AS (
      SELECT
        t.master_metadata_album_artist_name AS artist,
        CASE 
          WHEN f.first_year = c.year THEN 'new'
          ELSE 'old'
        END AS category
      FROM ${TABLE} t
      JOIN artist_first_listen f ON t.master_metadata_album_artist_name = f.artist
      CROSS JOIN current_year c
      WHERE YEAR(t.ts::DATE) = c.year
        AND t.master_metadata_album_artist_name IS NOT NULL
    )
    SELECT
      SUM(CASE WHEN category = 'new' THEN 1 ELSE 0 END)::DOUBLE AS new_artists_streams,
      SUM(CASE WHEN category = 'old' THEN 1 ELSE 0 END)::DOUBLE AS old_artists_streams,
      COUNT(DISTINCT CASE WHEN category = 'new' THEN artist END)::DOUBLE AS new_artists_count,
      COUNT(*)::DOUBLE AS total
    FROM streams_classified
  `
}
