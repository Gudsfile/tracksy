import { TABLE } from '../../../../db/queries/constants'

export type NewVsOldResult = {
    new_artists_streams: number
    old_artists_streams: number
    new_artists_count: number
    total: number
}

export function queryNewVsOld(year: number): string {
    return `
    WITH artist_first_listen AS (
      SELECT
        artist_name,
        MIN(YEAR(ts::DATE)) AS first_year
      FROM ${TABLE}
      WHERE artist_name IS NOT NULL
      GROUP BY artist_name
    ),
    streams_classified AS (
      SELECT
        artist_name AS artist,
        CASE
          WHEN first_year = ${year} THEN 'new'
          ELSE 'old'
        END AS category
      FROM ${TABLE}
      JOIN artist_first_listen USING(artist_name)
      WHERE YEAR(ts::DATE) = ${year}
        AND artist_name IS NOT NULL
    )
    SELECT
      COUNT(*) FILTER (WHERE category = 'new')::DOUBLE AS new_artists_streams,
      COUNT(*) FILTER (WHERE category = 'old')::DOUBLE AS old_artists_streams,
      COUNT(DISTINCT CASE WHEN category = 'new' THEN artist END)::DOUBLE AS new_artists_count,
      COUNT(*)::DOUBLE AS total
    FROM streams_classified
  `
}
