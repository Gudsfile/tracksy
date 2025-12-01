import { TABLE } from '../../../../db/queries/constants'

export type RegularityResult = {
    days_with_streams: number
    total_days: number
    longest_pause_days: number
}

export function queryRegularity(): string {
    return `
    WITH date_range AS (
      SELECT 
        MIN(ts::DATE) AS first_day,
        MAX(ts::DATE) AS last_day,
        DATE_DIFF('day', MIN(ts::DATE), MAX(ts::DATE)) + 1 AS total_days
      FROM ${TABLE}
    ),
    listening_days AS (
      SELECT COUNT(DISTINCT ts::DATE) AS days_with_streams
      FROM ${TABLE}
    ),
    max_gap AS (
      SELECT MAX(gap) AS longest_pause_days
      FROM (
        SELECT DATE_DIFF('day', LAG(day) OVER (ORDER BY day), day) -1 AS gap
        FROM (SELECT DISTINCT ts::DATE AS day FROM ${TABLE})
      )
    )
    SELECT
      days_with_streams::DOUBLE as days_with_streams,
      total_days::DOUBLE as total_days,
      COALESCE(longest_pause_days, 0)::DOUBLE AS longest_pause_days
    FROM listening_days, date_range, max_gap;
  `
}
