import { TABLE } from '../../../../db/queries/constants'

export type RegularityResult = {
    days_with_streams: number
    total_days: number
    longest_pause_days: number
}

export function queryRegularity(year: number): string {
    return `
    WITH
    max_date AS (
      SELECT MIN(ts) AS max_date
      FROM (
        SELECT MAX(ts::DATE) as ts FROM ${TABLE}
        UNION
        (SELECT '${year}-12-31'::DATE as ts)
      )
    ),
    selected_tracks AS (
      SELECT * FROM ${TABLE}
      WHERE YEAR(ts::DATE) = ${year}
    ),
    date_range AS (
      SELECT 
        COUNT(*) AS total_days
      FROM generate_series('${year}-01-01'::DATE, (SELECT max_date FROM max_date), INTERVAL 1 DAY) AS t(d)
    ),
    listening_days_count AS (
      SELECT COUNT(DISTINCT ts::DATE) AS days_with_streams
      FROM selected_tracks
    ),
    listening_days AS (
      (SELECT DISTINCT ts::DATE AS day FROM selected_tracks)
      UNION
      (select '${year}-01-01'::DATE - 1 as day)
      UNION
      (select max_date + 1 as day from max_date)
    ),
    gaps AS (
      SELECT DATE_DIFF('day', LAG(day) OVER (ORDER BY day), day) -1 AS gap
      FROM listening_days
    ),
    max_gap AS (
      SELECT MAX(gap) AS longest_pause_days
      FROM gaps
    )
    SELECT 
      days_with_streams::DOUBLE as days_with_streams,
      total_days::DOUBLE as total_days,
      COALESCE(longest_pause_days, 0)::DOUBLE AS longest_pause_days
    FROM listening_days_count, date_range, max_gap;
  `
}
