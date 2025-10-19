import { TABLE } from '../../db/queries/constants'

export const query = `
SELECT
  MIN(min_datetime) AS min_datetime,
  MAX(max_datetime) AS max_datetime,
  MAX(count_hourly_stream) AS max_count_hourly_stream
FROM (
  SELECT
    MIN(ts::DATETIME) AS min_datetime,
    MAX(ts::DATETIME) AS max_datetime,
    COUNT(*) AS count_hourly_stream
  FROM ${TABLE}
  GROUP BY HOUR(ts::DATETIME), YEAR(ts::DATETIME)
)
`

export type SummarizeData = {
    min_datetime: string
    max_datetime: string
    max_count_hourly_stream: number
}
