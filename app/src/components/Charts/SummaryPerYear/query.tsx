import { TABLE } from '../../../db/queries/constants'

export function queryByYear(year: number | undefined) {
    return `
WITH ranked_streams AS (
  SELECT
    YEAR(ts::DATETIME)::INT AS year,
    ROW_NUMBER() OVER (PARTITION BY spotify_track_uri ORDER BY ts::DATETIME) AS rank_all_time,
    ROW_NUMBER() OVER (PARTITION BY spotify_track_uri, YEAR(ts::DATETIME) ORDER BY ts::DATETIME) AS rank_per_year,
    MIN(YEAR(ts::DATETIME)::INT) OVER (PARTITION BY spotify_track_uri) as first_year
  FROM ${TABLE}
)
UNPIVOT (
  SELECT
    year,
    SUM(CASE WHEN rank_all_time = 1 THEN 1 ELSE 0 END)::INT AS new_unique,
    SUM(CASE WHEN first_year = year AND rank_all_time != 1 THEN 1 ELSE 0 END)::INT AS new_repeat,
    SUM(CASE WHEN first_year < year AND rank_per_year = 1 THEN 1 ELSE 0 END)::INT AS old_unique,
    SUM(CASE WHEN first_year < year AND rank_per_year != 1 THEN 1 ELSE 0 END)::INT AS old_repeat
  FROM ranked_streams
  ${year ? `WHERE ranked_streams.year = ${year}` : ''}
  GROUP BY year
)
ON COLUMNS(* EXCLUDE (year))
INTO
  NAME type
  VALUE count_streams
`
}

export type QueryResult = {
    year: number
    type: string
    count_streams: number
}
