import { TABLE } from '../../../db/queries/constants'

export function queryTopStreak() {
    return `
WITH dates AS (
  SELECT DISTINCT ts::DATE as date FROM ${TABLE}
),
groups AS (
  SELECT
    date,
    date - INTERVAL '1' DAY * (ROW_NUMBER() OVER (ORDER BY date)) AS grp
  FROM dates
)
SELECT
  MIN(date) AS start_ts,
  MAX(date) AS end_ts,
  COUNT(*)::INTEGER AS streaks
FROM groups
GROUP BY grp
ORDER BY streaks DESC
LIMIT 1
`
}

export function queryCurrentStreak() {
    return `
WITH dates AS (
  SELECT DISTINCT ts::DATE as date FROM ${TABLE}
),
groups AS (
  SELECT
    date,
    date - INTERVAL '1' DAY * (ROW_NUMBER() OVER (ORDER BY date)) AS grp
  FROM dates
)
SELECT
  MIN(date) AS start_ts,
  MAX(date) AS end_ts,
  COUNT(*)::INTEGER AS streaks
FROM groups
GROUP BY grp
ORDER BY end_ts DESC
LIMIT 1
`
}

export type TopStreakQueryResult = {
    start_ts: number
    end_ts: number
    streaks: number
}
