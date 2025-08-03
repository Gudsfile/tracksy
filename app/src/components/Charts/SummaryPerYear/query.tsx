import { TABLE } from '../../../db/queries/constants'
import type { Int, Utf8 } from 'apache-arrow'

export const query = `
WITH ranked_streams AS (
    SELECT
      YEAR(ts::DATETIME)::INT as year,
      row_number() OVER (PARTITION BY spotify_track_uri ORDER BY ts::DATETIME) AS rank_all_time,
      row_number() OVER (PARTITION BY spotify_track_uri, YEAR(ts::DATETIME) ORDER BY ts::DATETIME) AS rank_per_year
    FROM ${TABLE}
)
UNPIVOT (
  SELECT
    year,
    SUM(CASE WHEN rank_all_time = 1 THEN 1 ELSE 0 END)::INT AS count_new_tracks_played,
    SUM(CASE WHEN rank_all_time != 1 AND rank_per_year == 1 THEN 1 ELSE 0 END)::INT AS count_unique_track_played,
    SUM(CASE WHEN rank_all_time != 1 AND rank_per_year != 1 THEN 1 ELSE 0 END)::INT AS count_other_tracks_played
  FROM ranked_streams
  GROUP BY year
)
ON COLUMNS(* EXCLUDE(year))
INTO
  NAME type
  VALUE count_streams
`

export type QueryResult = {
    year: Int
    type: Utf8
    count_streams: Int
}
