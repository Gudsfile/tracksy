import { TABLE } from '../../../../db/queries/constants'

export type ArtistDiscoveryQueryResult = {
    year: number
    new_artists: number
    cumulative_artists: number
    avg_listens_per_artist: number
}

export function queryArtistDiscovery(): string {
    return `
    WITH artist_first_year AS (
      SELECT
        artist_name AS artist,
        MIN(YEAR(ts::DATE)) AS discovery_year
      FROM ${TABLE}
      WHERE artist_name IS NOT NULL
      GROUP BY artist_name
    ),
    yearly_discoveries AS (
      SELECT
        discovery_year AS year,
        COUNT(*) AS new_artists
      FROM artist_first_year
      GROUP BY discovery_year
    ),
    year_bounds AS (
      SELECT
        MIN(YEAR(ts::DATE)) AS min_year,
        MAX(YEAR(ts::DATE)) AS max_year
      FROM ${TABLE}
    ),
    all_years AS (
      SELECT year
      FROM year_bounds,
      generate_series(min_year, max_year) AS t(year)
    ),
    filled_years AS (
      SELECT
        all_years.year,
        COALESCE(yearly_discoveries.new_artists, 0) AS new_artists
      FROM all_years all_years
      LEFT JOIN yearly_discoveries ON all_years.year = yearly_discoveries.year
    ),
    cumulative AS (
      SELECT
        year,
        new_artists,
        SUM(new_artists) OVER (ORDER BY year) AS cumulative_artists
      FROM filled_years
    ),
    artist_listens AS (
      SELECT
        YEAR(ts::DATE) AS year,
        artist_name AS artist,
        COUNT(*) AS listen_count
      FROM ${TABLE}
      WHERE artist_name IS NOT NULL
      GROUP BY YEAR(ts::DATE), artist_name
    ),
    avg_listens AS (
      SELECT
        year,
        AVG(listen_count) AS avg_listens_per_artist
      FROM artist_listens
      GROUP BY year
    )
    SELECT
      cumulative.year::INT AS year,
      cumulative.new_artists::DOUBLE AS new_artists,
      cumulative.cumulative_artists::DOUBLE AS cumulative_artists,
      COALESCE(avg_listens.avg_listens_per_artist, 0)::DOUBLE AS avg_listens_per_artist
    FROM cumulative
    LEFT JOIN avg_listens using(year)
    ORDER BY cumulative.year
  `
}
