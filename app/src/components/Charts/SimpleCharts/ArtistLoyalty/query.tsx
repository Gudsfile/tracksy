import { TABLE } from '../../../../db/queries/constants'

export type ArtistLoyaltyResult = {
    stream_bin: string
    artist_count: number
    streams_in_bin: number
    share_of_total_streams: number
}

export function queryArtistLoyalty(year: number): string {
    return `
    WITH artist_total AS (
      SELECT
        artist_name AS artist,
        COUNT(*) AS total_streams
      FROM ${TABLE}
      WHERE artist_name IS NOT NULL
        AND YEAR(ts::DATE) = ${year}
      GROUP BY artist
    ),
    artist_bins AS (
      SELECT
        CASE
          WHEN total_streams = 1 THEN '1'
          WHEN total_streams BETWEEN 2 AND 10 THEN '2-10'
          WHEN total_streams BETWEEN 11 AND 100 THEN '11-100'
          WHEN total_streams BETWEEN 101 AND 1000 THEN '101-1000'
          ELSE '1000+'
        END AS stream_bin,
        COUNT(*) AS artist_count,
        SUM(total_streams) AS streams_in_bin
      FROM artist_total
      GROUP BY 1
    )
    SELECT
      stream_bin,
      coalesce(artist_count, 0)::DOUBLE as artist_count,
      coalesce(streams_in_bin, 0)::DOUBLE as streams_in_bin,
      coalesce(ROUND(streams_in_bin / SUM(streams_in_bin) OVER (), 4), 0)::DOUBLE AS share_of_total_streams
    FROM artist_bins
    ORDER BY
      CASE stream_bin
        WHEN '1' THEN 1
        WHEN '2-10' THEN 2
        WHEN '11-100' THEN 3
        WHEN '101-1000' THEN 4
        WHEN '1000+' THEN 5
      END
    `
}
